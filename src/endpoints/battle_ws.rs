use axum::{
    body::Body,
    extract::{Path, Request},
    http::{header, StatusCode},
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::fs;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use crate::interface::{Element, Traits};

use std::sync::{Arc, LazyLock};
use tokio::sync::{mpsc, Mutex};

pub use crate::utils::battle::{Rng, hp_computation};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CardState {
    pub instance_id: String,
    pub element: Element,
    pub level: u8,
    pub original_hp: u16,
    pub max_hp: f64,
    pub current_hp: f64,
    pub attack_count: u32,
    pub status: String, // "active", "bench", "defeated"
    pub dissolve_progress: f32,
    pub is_dissolving: bool,
    pub shake: f32,
}

fn default_mode() -> String {
    "vs_ai".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BattleState {
    #[serde(default)]
    pub battle_id: String,
    #[serde(default = "default_mode")]
    pub mode: String, // "vs_ai" or "vs_human"
    #[serde(default)]
    pub player1_name: String,
    #[serde(default)]
    pub player2_name: String,
    pub player_deck: Vec<CardState>,
    pub bot_deck: Vec<CardState>,
    pub player_active_index: usize,
    pub bot_active_index: usize,
    pub turn: String, // "player", "bot", "player1", "player2"
    pub is_busy: bool,
    pub battle_state: String, // "active", "selecting_replacement", "victory", "defeat"
    pub is_auto_pilot: bool,
    pub logs: Vec<String>,
}

impl BattleState {
    pub fn add_log(&mut self, msg: String) {
        self.logs.insert(0, msg);
        if self.logs.len() > 10 {
            self.logs.pop();
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum ClientWsMessage {
    #[serde(rename = "init")]
    Init {
        #[serde(default, rename = "battleId")]
        battle_id: Option<String>,
        #[serde(default, rename = "mode")]
        mode: Option<String>,
        #[serde(default, rename = "username")]
        username: Option<String>,
        #[serde(default, rename = "playerRole")]
        player_role: Option<String>,
        #[serde(default, rename = "playerSelectedElements")]
        player_selected_elements: Vec<Element>,
    },
    #[serde(rename = "queue")]
    Queue {
        #[serde(default, rename = "username")]
        username: Option<String>,
        #[serde(default, rename = "playerSelectedElements")]
        player_selected_elements: Vec<Element>,
    },
    #[serde(rename = "cancel_queue")]
    CancelQueue,
    #[serde(rename = "attack")]
    Attack,
    #[serde(rename = "skill")]
    Skill,
    #[serde(rename = "switch")]
    Switch {
        #[serde(rename = "targetIndex")]
        target_index: usize,
    },
    #[serde(rename = "autopilot")]
    AutoPilot {
        enabled: bool,
    },
}

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type")]
pub enum ServerWsMessage {
    #[serde(rename = "searching")]
    Searching {
        message: String,
    },
    #[serde(rename = "match_found")]
    MatchFound {
        #[serde(rename = "battleId")]
        battle_id: String,
        #[serde(rename = "playerRole")]
        player_role: String,
        #[serde(rename = "opponentName")]
        opponent_name: String,
        state: BattleState,
    },
    #[serde(rename = "state_sync")]
    StateSync {
        state: BattleState,
        #[serde(skip_serializing_if = "Option::is_none", rename = "playerRole")]
        player_role: Option<String>,
    },
    #[serde(rename = "action_event")]
    ActionEvent {
        action: String,
        attacker: String,
        damage: u32,
        #[serde(rename = "isCrit")]
        is_crit: bool,
        #[serde(rename = "isWeak")]
        is_weak: bool,
        #[serde(rename = "isStrong")]
        is_strong: bool,
        #[serde(rename = "is3rdAttack")]
        is_3rd_attack: bool,
        #[serde(rename = "logMessage")]
        log_message: String,
        state: BattleState,
    },
    #[serde(rename = "error")]
    Error {
        message: String,
    },
}

pub use crate::utils::battle::calculate_damage;

pub struct WaitingPlayer {
    pub session_id: String,
    pub username: String,
    pub elements: Vec<Element>,
    pub tx: mpsc::UnboundedSender<ServerWsMessage>,
}

#[derive(Debug, Clone)]
pub struct PendingMatch {
    pub battle_id: String,
    pub p1_username: String,
    pub p2_username: String,
    pub p1_elements: Vec<Element>,
    pub p2_elements: Vec<Element>,
}

pub struct PvPRoom {
    pub battle_id: String,
    pub p1_username: String,
    pub p2_username: String,
    pub p1_tx: Option<mpsc::UnboundedSender<ServerWsMessage>>,
    pub p2_tx: Option<mpsc::UnboundedSender<ServerWsMessage>>,
    pub state: BattleState,
}

static MATCHMAKING_QUEUE: LazyLock<Arc<Mutex<Vec<WaitingPlayer>>>> =
    LazyLock::new(|| Arc::new(Mutex::new(Vec::new())));

static PENDING_MATCHES: LazyLock<Arc<Mutex<HashMap<String, PendingMatch>>>> =
    LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));

static PVP_ROOMS: LazyLock<Arc<Mutex<HashMap<String, Arc<Mutex<PvPRoom>>>>>> =
    LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));

fn sha1(data: &[u8]) -> [u8; 20] {
    let mut h0: u32 = 0x67452301;
    let mut h1: u32 = 0xEFCDAB89;
    let mut h2: u32 = 0x98BADCFE;
    let mut h3: u32 = 0x10325476;
    let mut h4: u32 = 0xC3D2E1F0;

    let bit_len = (data.len() as u64) * 8;
    let mut msg = data.to_vec();
    msg.push(0x80);
    while (msg.len() % 64) != 56 {
        msg.push(0);
    }
    msg.extend_from_slice(&bit_len.to_be_bytes());

    for chunk in msg.chunks(64) {
        let mut w = [0u32; 80];
        for i in 0..16 {
            w[i] = u32::from_be_bytes([
                chunk[i * 4],
                chunk[i * 4 + 1],
                chunk[i * 4 + 2],
                chunk[i * 4 + 3],
            ]);
        }
        for i in 16..80 {
            w[i] = (w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]).rotate_left(1);
        }

        let mut a = h0;
        let mut b = h1;
        let mut c = h2;
        let mut d = h3;
        let mut e = h4;

        for i in 0..80 {
            let (f, k) = match i {
                0..=19 => ((b & c) | ((!b) & d), 0x5A827999),
                20..=39 => (b ^ c ^ d, 0x6ED9EBA1),
                40..=59 => ((b & c) | (b & d) | (c & d), 0x8F1BBCDC),
                _ => (b ^ c ^ d, 0xCA62C1D6),
            };
            let temp = a
                .rotate_left(5)
                .wrapping_add(f)
                .wrapping_add(e)
                .wrapping_add(k)
                .wrapping_add(w[i]);
            e = d;
            d = c;
            c = b.rotate_left(30);
            b = a;
            a = temp;
        }

        h0 = h0.wrapping_add(a);
        h1 = h1.wrapping_add(b);
        h2 = h2.wrapping_add(c);
        h3 = h3.wrapping_add(d);
        h4 = h4.wrapping_add(e);
    }

    let mut out = [0u8; 20];
    out[0..4].copy_from_slice(&h0.to_be_bytes());
    out[4..8].copy_from_slice(&h1.to_be_bytes());
    out[8..12].copy_from_slice(&h2.to_be_bytes());
    out[12..16].copy_from_slice(&h3.to_be_bytes());
    out[16..20].copy_from_slice(&h4.to_be_bytes());
    out
}

fn base64_encode(input: &[u8]) -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::new();
    let mut i = 0;
    while i < input.len() {
        let b0 = input[i];
        let b1 = if i + 1 < input.len() { input[i + 1] } else { 0 };
        let b2 = if i + 2 < input.len() { input[i + 2] } else { 0 };

        let triple = ((b0 as u32) << 16) | ((b1 as u32) << 8) | (b2 as u32);

        out.push(CHARSET[((triple >> 18) & 0x3F) as usize] as char);
        out.push(CHARSET[((triple >> 12) & 0x3F) as usize] as char);
        if i + 1 < input.len() {
            out.push(CHARSET[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
        if i + 2 < input.len() {
            out.push(CHARSET[(triple & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
        i += 3;
    }
    out
}

pub fn compute_ws_accept(key: &str) -> String {
    let mut concatenated = key.trim().to_string();
    concatenated.push_str("258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
    let sha = sha1(concatenated.as_bytes());
    base64_encode(&sha)
}

pub async fn read_ws_frame<R: AsyncReadExt + Unpin>(reader: &mut R) -> std::io::Result<Option<Vec<u8>>> {
    let mut header = [0u8; 2];
    if reader.read_exact(&mut header).await.is_err() {
        return Ok(None);
    }
    let opcode = header[0] & 0x0F;
    let masked = (header[1] & 0x80) != 0;
    let mut payload_len = (header[1] & 0x7F) as usize;

    if opcode == 8 {
        return Ok(None);
    }

    if payload_len == 126 {
        let mut len_bytes = [0u8; 2];
        reader.read_exact(&mut len_bytes).await?;
        payload_len = u16::from_be_bytes(len_bytes) as usize;
    } else if payload_len == 127 {
        let mut len_bytes = [0u8; 8];
        reader.read_exact(&mut len_bytes).await?;
        payload_len = u64::from_be_bytes(len_bytes) as usize;
    }

    let mask_key = if masked {
        let mut mask = [0u8; 4];
        reader.read_exact(&mut mask).await?;
        Some(mask)
    } else {
        None
    };

    let mut payload = vec![0u8; payload_len];
    if payload_len > 0 {
        reader.read_exact(&mut payload).await?;
    }

    if let Some(mask) = mask_key {
        for (i, byte) in payload.iter_mut().enumerate() {
            *byte ^= mask[i % 4];
        }
    }

    Ok(Some(payload))
}

pub async fn send_ws_json<W: AsyncWriteExt + Unpin, T: Serialize>(writer: &mut W, msg: &T) -> std::io::Result<()> {
    let text = serde_json::to_string(msg).unwrap_or_default();
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut frame = Vec::new();

    frame.push(0x81); // FIN + Text frame

    if len <= 125 {
        frame.push(len as u8);
    } else if len <= 65535 {
        frame.push(126);
        frame.extend_from_slice(&(len as u16).to_be_bytes());
    } else {
        frame.push(127);
        frame.extend_from_slice(&(len as u64).to_be_bytes());
    }

    frame.extend_from_slice(bytes);
    writer.write_all(&frame).await?;
    writer.flush().await?;
    Ok(())
}

pub async fn ws_search_handler(req: Request) -> Response {
    let ws_key = match req.headers().get("sec-websocket-key") {
        Some(k) => match k.to_str() {
            Ok(s) => s.to_string(),
            Err(_) => return StatusCode::BAD_REQUEST.into_response(),
        },
        None => return StatusCode::BAD_REQUEST.into_response(),
    };

    let accept_key = compute_ws_accept(&ws_key);

    let on_upgrade = match hyper::upgrade::on(req).await {
        Ok(upgraded) => upgraded,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    tokio::spawn(async move {
        let io = hyper_util::rt::TokioIo::new(on_upgrade);
        let (mut reader, mut writer) = tokio::io::split(io);

        let (tx, mut rx) = mpsc::unbounded_channel::<ServerWsMessage>();
        let mut rng = Rng::new();
        let session_id = format!("search_{:06x}", rng.next_u64() % 0xffffff);

        loop {
            tokio::select! {
                Some(srv_msg) = rx.recv() => {
                    if send_ws_json(&mut writer, &srv_msg).await.is_err() {
                        break;
                    }
                }
                res = read_ws_frame(&mut reader) => {
                    let payload = match res {
                        Ok(Some(p)) => p,
                        _ => break,
                    };
                    let msg_str = match String::from_utf8(payload) {
                        Ok(s) => s,
                        Err(_) => continue,
                    };

                    let client_msg: ClientWsMessage = match serde_json::from_str(&msg_str) {
                        Ok(m) => m,
                        Err(e) => {
                            let _ = send_ws_json(&mut writer, &ServerWsMessage::Error { message: format!("Invalid message JSON: {}", e) }).await;
                            continue;
                        }
                    };

                    match client_msg {
                        ClientWsMessage::Init { username, player_selected_elements, .. }
                        | ClientWsMessage::Queue { username, player_selected_elements, .. } => {
                            let player_name = username.unwrap_or_else(|| "OPERATOR".to_string());
                            let mut queue = MATCHMAKING_QUEUE.lock().await;

                            if let Some(waiting) = queue.pop() {
                                let active_battle_id = format!("pvp_{:06x}", rng.next_u64() % 0xffffff);

                                let pending = PendingMatch {
                                    battle_id: active_battle_id.clone(),
                                    p1_username: waiting.username.clone(),
                                    p2_username: player_name.clone(),
                                    p1_elements: waiting.elements,
                                    p2_elements: player_selected_elements,
                                };

                                PENDING_MATCHES.lock().await.insert(active_battle_id.clone(), pending);

                                let _ = waiting.tx.send(ServerWsMessage::MatchFound {
                                    battle_id: active_battle_id.clone(),
                                    player_role: "player1".to_string(),
                                    opponent_name: player_name.clone(),
                                    state: BattleState {
                                        battle_id: active_battle_id.clone(),
                                        mode: "vs_human".to_string(),
                                        player1_name: waiting.username.clone(),
                                        player2_name: player_name.clone(),
                                        player_deck: vec![],
                                        bot_deck: vec![],
                                        player_active_index: 0,
                                        bot_active_index: 0,
                                        turn: "player1".to_string(),
                                        is_busy: false,
                                        battle_state: "active".to_string(),
                                        is_auto_pilot: false,
                                        logs: vec![],
                                    },
                                });

                                let _ = tx.send(ServerWsMessage::MatchFound {
                                    battle_id: active_battle_id.clone(),
                                    player_role: "player2".to_string(),
                                    opponent_name: waiting.username,
                                    state: BattleState {
                                        battle_id: active_battle_id,
                                        mode: "vs_human".to_string(),
                                        player1_name: player_name,
                                        player2_name: "".to_string(),
                                        player_deck: vec![],
                                        bot_deck: vec![],
                                        player_active_index: 0,
                                        bot_active_index: 0,
                                        turn: "player1".to_string(),
                                        is_busy: false,
                                        battle_state: "active".to_string(),
                                        is_auto_pilot: false,
                                        logs: vec![],
                                    },
                                });
                            } else {
                                queue.push(WaitingPlayer {
                                    session_id: session_id.clone(),
                                    username: player_name,
                                    elements: player_selected_elements,
                                    tx: tx.clone(),
                                });
                                let _ = tx.send(ServerWsMessage::Searching {
                                    message: "Searching for a random human opponent...".to_string(),
                                });
                            }
                        }
                        ClientWsMessage::CancelQueue => {
                            let mut queue = MATCHMAKING_QUEUE.lock().await;
                            queue.retain(|p| p.session_id != session_id);
                        }
                        _ => {}
                    }
                }
            }
        }

        let mut queue = MATCHMAKING_QUEUE.lock().await;
        queue.retain(|p| p.session_id != session_id);
    });

    Response::builder()
        .status(StatusCode::SWITCHING_PROTOCOLS)
        .header(header::CONNECTION, "Upgrade")
        .header(header::UPGRADE, "websocket")
        .header("sec-websocket-accept", accept_key)
        .body(Body::empty())
        .unwrap()
}

pub async fn ws_battle_handler_id(
    Path(id): Path<String>,
    req: Request,
) -> Response {
    handle_ws_battle(Some(id), req).await
}

pub async fn ws_battle_handler(req: Request) -> Response {
    handle_ws_battle(None, req).await
}

pub async fn handle_ws_battle(path_battle_id: Option<String>, req: Request) -> Response {
    let ws_key = match req.headers().get("sec-websocket-key") {
        Some(k) => match k.to_str() {
            Ok(s) => s.to_string(),
            Err(_) => return StatusCode::BAD_REQUEST.into_response(),
        },
        None => return StatusCode::BAD_REQUEST.into_response(),
    };

    let accept_key = compute_ws_accept(&ws_key);

    let on_upgrade = match hyper::upgrade::on(req).await {
        Ok(upgraded) => upgraded,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    tokio::spawn(async move {
        let io = hyper_util::rt::TokioIo::new(on_upgrade);
        let (mut reader, mut writer) = tokio::io::split(io);

        let (tx, mut rx) = mpsc::unbounded_channel::<ServerWsMessage>();
        let mut battle_state: Option<BattleState> = None;
        let mut current_pvp_room_id: Option<String> = None;
        let mut player_role: String = "player".to_string();
        let mut traits_data: Traits = HashMap::new();
        let mut all_elements: Vec<Element> = Vec::new();
        let mut rng = Rng::new();

        if let Ok(content) = fs::read_to_string("data/traits.json").await {
            if let Ok(parsed) = serde_json::from_str::<Traits>(&content) {
                traits_data = parsed;
            }
        }
        if let Ok(content) = fs::read_to_string("data/elements.json").await {
            if let Ok(parsed) = serde_json::from_str::<Vec<Element>>(&content) {
                all_elements = parsed;
            }
        }

        loop {
            tokio::select! {
                Some(srv_msg) = rx.recv() => {
                    if send_ws_json(&mut writer, &srv_msg).await.is_err() {
                        break;
                    }
                }
                res = read_ws_frame(&mut reader) => {
                    let payload = match res {
                        Ok(Some(p)) => p,
                        _ => break,
                    };
                    let msg_str = match String::from_utf8(payload) {
                        Ok(s) => s,
                        Err(_) => continue,
                    };

                    let client_msg: ClientWsMessage = match serde_json::from_str(&msg_str) {
                        Ok(m) => m,
                        Err(e) => {
                            let _ = send_ws_json(&mut writer, &ServerWsMessage::Error { message: format!("Invalid message JSON: {}", e) }).await;
                            continue;
                        }
                    };

                    match client_msg {
                        ClientWsMessage::Init { battle_id, username, player_role: role_opt, player_selected_elements, .. } => {
                            let active_id = battle_id
                                .or(path_battle_id.clone())
                                .unwrap_or_else(|| format!("battle_{:06x}", rng.next_u64() % 0xffffff));

                            let p_role = role_opt.unwrap_or_else(|| "player".to_string());
                            player_role = p_role.clone();
                            let player_name = username.unwrap_or_else(|| "OPERATOR".to_string());

                            let mut rooms = PVP_ROOMS.lock().await;

                            if let Some(room_arc) = rooms.get(&active_id) {
                                // PvP Room already exists, connect player!
                                let mut room = room_arc.lock().await;
                                if p_role == "player1" {
                                    room.p1_tx = Some(tx.clone());
                                } else {
                                    room.p2_tx = Some(tx.clone());
                                }
                                current_pvp_room_id = Some(active_id.clone());
                                let sync = ServerWsMessage::StateSync { state: room.state.clone(), player_role: Some(p_role) };
                                let _ = tx.send(sync);
                            } else {
                                // Check if pending match exists for this active_id
                                let mut pending_map = PENDING_MATCHES.lock().await;
                                if let Some(pending) = pending_map.remove(&active_id) {
                                    let p1_deck: Vec<CardState> = pending.p1_elements.into_iter().enumerate().map(|(idx, el)| {
                                        let level = if el.level > 0 { el.level } else { (idx + 1) as u8 };
                                        let original_hp = el.hp;
                                        let max_hp = hp_computation(level, original_hp);
                                        CardState { instance_id: format!("p1_{}", idx), element: el, level, original_hp, max_hp, current_hp: max_hp, attack_count: 0, status: if idx == 0 { "active".to_string() } else { "bench".to_string() }, dissolve_progress: 0.0, is_dissolving: false, shake: 0.0 }
                                    }).collect();

                                    let p2_deck: Vec<CardState> = pending.p2_elements.into_iter().enumerate().map(|(idx, el)| {
                                        let level = if el.level > 0 { el.level } else { (idx + 1) as u8 };
                                        let original_hp = el.hp;
                                        let max_hp = hp_computation(level, original_hp);
                                        CardState { instance_id: format!("p2_{}", idx), element: el, level, original_hp, max_hp, current_hp: max_hp, attack_count: 0, status: if idx == 0 { "active".to_string() } else { "bench".to_string() }, dissolve_progress: 0.0, is_dissolving: false, shake: 0.0 }
                                    }).collect();

                                    let mut pvp_state = BattleState {
                                        battle_id: active_id.clone(),
                                        mode: "vs_human".to_string(),
                                        player1_name: pending.p1_username.clone(),
                                        player2_name: pending.p2_username.clone(),
                                        player_deck: p1_deck,
                                        bot_deck: p2_deck,
                                        player_active_index: 0,
                                        bot_active_index: 0,
                                        turn: "player1".to_string(),
                                        is_busy: false,
                                        battle_state: "active".to_string(),
                                        is_auto_pilot: false,
                                        logs: Vec::new(),
                                    };
                                    pvp_state.add_log(format!("⚔️ MATCH START! [{}] {} vs {}", active_id, pending.p1_username, pending.p2_username));

                                    let is_p1 = p_role == "player1";
                                    let room = Arc::new(Mutex::new(PvPRoom {
                                        battle_id: active_id.clone(),
                                        p1_username: pending.p1_username,
                                        p2_username: pending.p2_username,
                                        p1_tx: if is_p1 { Some(tx.clone()) } else { None },
                                        p2_tx: if !is_p1 { Some(tx.clone()) } else { None },
                                        state: pvp_state.clone(),
                                    }));

                                    rooms.insert(active_id.clone(), room);
                                    current_pvp_room_id = Some(active_id);
                                    let _ = tx.send(ServerWsMessage::StateSync { state: pvp_state, player_role: Some(p_role) });
                                } else {
                                    // Singleplayer VS AI Mode
                                    let mut p_elements = player_selected_elements;
                                    if p_elements.len() < 3 && !all_elements.is_empty() {
                                        p_elements = all_elements.iter().take(3).cloned().collect();
                                    }

                                    let player_deck: Vec<CardState> = p_elements.into_iter().enumerate().map(|(idx, el)| {
                                        let level = if el.level > 0 { el.level } else { (idx + 1) as u8 };
                                        let original_hp = el.hp;
                                        let max_hp = hp_computation(level, original_hp);
                                        CardState { instance_id: format!("player_{}", idx), element: el, level, original_hp, max_hp, current_hp: max_hp, attack_count: 0, status: if idx == 0 { "active".to_string() } else { "bench".to_string() }, dissolve_progress: 0.0, is_dissolving: false, shake: 0.0 }
                                    }).collect();

                                    let bot_deck: Vec<CardState> = (0..3).map(|idx| {
                                        let mut el = all_elements.get(rng.gen_range_u32(0, (all_elements.len() - 1) as u32) as usize).cloned().unwrap();
                                        let el_lvl = rng.gen_range_u32(1, 10) as u8;
                                        el.level = el_lvl;
                                        let original_hp = el.hp;
                                        let max_hp = hp_computation(el_lvl, original_hp);
                                        CardState { instance_id: format!("bot_{}", idx), element: el, level: el_lvl, original_hp, max_hp, current_hp: max_hp, attack_count: 0, status: if idx == 0 { "active".to_string() } else { "bench".to_string() }, dissolve_progress: 0.0, is_dissolving: false, shake: 0.0 }
                                    }).collect();

                                    let mut new_state = BattleState {
                                        battle_id: active_id.clone(),
                                        mode: "vs_ai".to_string(),
                                        player1_name: player_name.clone(),
                                        player2_name: "BOT AI".to_string(),
                                        player_deck,
                                        bot_deck,
                                        player_active_index: 0,
                                        bot_active_index: 0,
                                        turn: "player".to_string(),
                                        is_busy: false,
                                        battle_state: "active".to_string(),
                                        is_auto_pilot: false,
                                        logs: Vec::new(),
                                    };
                                    new_state.add_log(format!("[SESSION {}] BATTLE INITIALIZED: {} vs Bot AI!", active_id, player_name));
                                    battle_state = Some(new_state.clone());
                                    let _ = tx.send(ServerWsMessage::StateSync { state: new_state, player_role: Some("player".into()) });
                                }
                            }
                        }
                        ClientWsMessage::Attack | ClientWsMessage::Skill => {
                            let is_skill = matches!(client_msg, ClientWsMessage::Skill);
                            if let Some(room_id) = &current_pvp_room_id {
                                let rooms = PVP_ROOMS.lock().await;
                                if let Some(room_arc) = rooms.get(room_id) {
                                    let mut room = room_arc.lock().await;
                                    let is_p1 = player_role == "player1";
                                    let is_my_turn = (is_p1 && room.state.turn == "player1") || (!is_p1 && room.state.turn == "player2");
                                    if is_my_turn && room.state.battle_state == "active" {
                                        let p1_name = room.state.player1_name.clone();
                                        let p2_name = room.state.player2_name.clone();
                                        let (atk_name, def_name) = if is_p1 { (p1_name.clone(), p2_name.clone()) } else { (p2_name.clone(), p1_name.clone()) };

                                        let (atk_idx, def_idx) = if is_p1 { (room.state.player_active_index, room.state.bot_active_index) } else { (room.state.bot_active_index, room.state.player_active_index) };
                                        let (p_elem, p_level, p_atk_cnt) = {
                                            let deck = if is_p1 { &mut room.state.player_deck } else { &mut room.state.bot_deck };
                                            if atk_idx < deck.len() { if is_skill { deck[atk_idx].attack_count += 1; } (deck[atk_idx].element.clone(), deck[atk_idx].level, deck[atk_idx].attack_count) } else { continue; }
                                        };
                                        let target_elem = { let def_deck = if is_p1 { &room.state.bot_deck } else { &room.state.player_deck }; if def_idx < def_deck.len() { def_deck[def_idx].element.clone() } else { continue; } };
                                        let (damage, is_crit, is_weak, is_strong, is_3rd_attack) = calculate_damage(&p_elem, &target_elem, &traits_data, p_level, p_atk_cnt, is_skill, &mut rng);

                                        let mut def_defeated = false;
                                        let mut next_card_index: Option<usize> = None;
                                        {
                                            let def_deck = if is_p1 { &mut room.state.bot_deck } else { &mut room.state.player_deck };
                                            def_deck[def_idx].current_hp = (def_deck[def_idx].current_hp - damage as f64).max(0.0);
                                            if def_deck[def_idx].current_hp <= 0.0 {
                                                def_deck[def_idx].status = "defeated".to_string();
                                                def_defeated = true;
                                                next_card_index = def_deck.iter().position(|c| c.current_hp > 0.0);
                                            }
                                        }

                                        if def_defeated {
                                            if let Some(next_i) = next_card_index {
                                                let def_deck = if is_p1 { &mut room.state.bot_deck } else { &mut room.state.player_deck };
                                                def_deck[next_i].status = "active".to_string();
                                                if is_p1 { room.state.bot_active_index = next_i; } else { room.state.player_active_index = next_i; }
                                                room.state.turn = if is_p1 { "player2".to_string() } else { "player1".to_string() };
                                            } else {
                                                room.state.battle_state = if is_p1 { "victory".to_string() } else { "defeat".to_string() };
                                            }
                                        } else {
                                            room.state.turn = if is_p1 { "player2".to_string() } else { "player1".to_string() };
                                        }

                                        let log_msg = format!("{}'s {} dealt {} damage to {}'s {}!", atk_name, p_elem.name, damage, def_name, target_elem.name);
                                        room.state.add_log(log_msg.clone());

                                        let evt = ServerWsMessage::ActionEvent { action: if is_skill { "player_skill".to_string() } else { "player_attack".to_string() }, attacker: if is_p1 { "player1".to_string() } else { "player2".to_string() }, damage, is_crit, is_weak, is_strong, is_3rd_attack, log_message: log_msg, state: room.state.clone() };
                                        if let Some(p1_tx) = &room.p1_tx { let _ = p1_tx.send(evt.clone()); }
                                        if let Some(p2_tx) = &room.p2_tx { let _ = p2_tx.send(evt); }
                                    }
                                }
                            } else if let Some(mut state) = battle_state.take() {
                                if state.turn == "player" && state.battle_state == "active" {
                                    let p_idx = state.player_active_index; let b_idx = state.bot_active_index;
                                    if p_idx < state.player_deck.len() && b_idx < state.bot_deck.len() {
                                        let (p_elem, p_level, p_atk_cnt) = { let p = &mut state.player_deck[p_idx]; if is_skill { p.attack_count += 1; } (p.element.clone(), p.level, p.attack_count) };
                                        let b_elem = state.bot_deck[b_idx].element.clone();
                                        let (damage, is_crit, is_weak, is_strong, is_3rd_attack) = calculate_damage(&p_elem, &b_elem, &traits_data, p_level, p_atk_cnt, is_skill, &mut rng);
                                        state.bot_deck[b_idx].current_hp = (state.bot_deck[b_idx].current_hp - damage as f64).max(0.0);
                                        let log_msg = format!("Player's {} attacked Bot's {} for {} damage!", p_elem.name, b_elem.name, damage);
                                        state.add_log(log_msg.clone());
                                        if state.bot_deck[b_idx].current_hp <= 0.0 { state.bot_deck[b_idx].status = "defeated".to_string(); let next_bot = state.bot_deck.iter().position(|c| c.current_hp > 0.0); if let Some(next_idx) = next_bot { state.bot_active_index = next_idx; state.bot_deck[next_idx].status = "active".to_string(); state.turn = "player".to_string(); } else { state.battle_state = "victory".to_string(); } } else { state.turn = "bot".to_string(); let b_active_elem = state.bot_deck[state.bot_active_index].element.clone(); let b_active_lvl = state.bot_deck[state.bot_active_index].level; let b_active_cnt = state.bot_deck[state.bot_active_index].attack_count; let p_active_elem = state.player_deck[p_idx].element.clone(); let (bot_dmg, _, _, _, _) = calculate_damage(&b_active_elem, &p_active_elem, &traits_data, b_active_lvl, b_active_cnt, false, &mut rng); state.player_deck[p_idx].current_hp = (state.player_deck[p_idx].current_hp - bot_dmg as f64).max(0.0); state.add_log(format!("Bot's {} attacked your {} for {} damage!", b_active_elem.name, p_active_elem.name, bot_dmg)); if state.player_deck[p_idx].current_hp <= 0.0 { state.player_deck[p_idx].status = "defeated".to_string(); let next_player = state.player_deck.iter().position(|c| c.current_hp > 0.0); if next_player.is_some() { state.battle_state = "selecting_replacement".to_string(); state.turn = "player".to_string(); } else { state.battle_state = "defeat".to_string(); } } else { state.turn = "player".to_string(); } }
                                        let evt = ServerWsMessage::ActionEvent { action: if is_skill { "player_skill".to_string() } else { "player_attack".to_string() }, attacker: "player".to_string(), damage, is_crit, is_weak, is_strong, is_3rd_attack, log_message: log_msg, state: state.clone() };
                                        battle_state = Some(state); let _ = tx.send(evt);
                                    } else { battle_state = Some(state); }
                                } else { battle_state = Some(state); }
                            }
                        }
                        ClientWsMessage::Switch { target_index } => {
                            if let Some(mut state) = battle_state.take() {
                                if target_index < state.player_deck.len() && state.player_deck[target_index].current_hp > 0.0 {
                                    state.player_deck[state.player_active_index].status = "bench".to_string(); state.player_active_index = target_index; state.player_deck[target_index].status = "active".to_string(); state.add_log(format!("Player switched to {}!", state.player_deck[target_index].element.name));
                                }
                                battle_state = Some(state.clone()); let _ = tx.send(ServerWsMessage::StateSync { state, player_role: Some(player_role.clone()) });
                            }
                        }
                        ClientWsMessage::AutoPilot { enabled } => {
                            if let Some(mut state) = battle_state.take() {
                                state.is_auto_pilot = enabled;
                                battle_state = Some(state.clone());
                                let _ = tx.send(ServerWsMessage::StateSync { state, player_role: Some(player_role.clone()) });
                            }
                        }
                        ClientWsMessage::CancelQueue | ClientWsMessage::Queue { .. } => {}
                    }
                }
            }
        }
    });

    Response::builder()
        .status(StatusCode::SWITCHING_PROTOCOLS)
        .header(header::CONNECTION, "Upgrade")
        .header(header::UPGRADE, "websocket")
        .header("sec-websocket-accept", accept_key)
        .body(Body::empty())
        .unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ws_accept_rfcc6455() {
        let key = "dGhlIHNhbXBsZSBub25jZQ==";
        let accept = compute_ws_accept(key);
        assert_eq!(accept, "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=");
    }

    #[test]
    fn test_hp_computation() {
        let hp = hp_computation(2, 10);
        assert_eq!(hp, 20.0);
    }

    #[test]
    fn test_client_ws_message_deserialization() {
        let init_json = r#"{"type":"init","battleId":"btl_12345","playerSelectedElements":[]}"#;
        let msg: ClientWsMessage = serde_json::from_str(init_json).unwrap();
        if let ClientWsMessage::Init { battle_id, .. } = msg {
            assert_eq!(battle_id, Some("btl_12345".to_string()));
        } else {
            panic!("Expected Init message");
        }

        let attack_json = r#"{"type":"attack"}"#;
        let msg_atk: ClientWsMessage = serde_json::from_str(attack_json).unwrap();
        assert!(matches!(msg_atk, ClientWsMessage::Attack));

        let switch_json = r#"{"type":"switch","targetIndex":2}"#;
        let msg_sw: ClientWsMessage = serde_json::from_str(switch_json).unwrap();
        if let ClientWsMessage::Switch { target_index } = msg_sw {
            assert_eq!(target_index, 2);
        } else {
            panic!("Expected Switch message");
        }
    }

    #[test]
    fn test_calculate_damage() {
        let attacker = Element {
            id: "O".to_string(),
            name: "Oxygen".to_string(),
            element_type: "nonmetal".to_string(),
            rarity: "common".to_string(),
            reactivity: 8,
            stability: 4,
            hp: 5,
            traits: vec!["oxidizer".to_string()],
            level: 1,
        };
        let defender = Element {
            id: "H".to_string(),
            name: "Hydrogen".to_string(),
            element_type: "nonmetal".to_string(),
            rarity: "common".to_string(),
            reactivity: 9,
            stability: 2,
            hp: 4,
            traits: vec!["fuel".to_string()],
            level: 1,
        };
        let mut traits = HashMap::new();
        traits.insert(
            "oxidizer".to_string(),
            crate::interface::TraitRelation {
                strong_against: vec!["fuel".to_string()],
                weak_against: vec![],
            },
        );

        let mut rng = Rng::new();
        let (damage, _, _, is_strong, _) = calculate_damage(&attacker, &defender, &traits, 1, 0, false, &mut rng);
        assert!(damage >= 1);
        assert!(is_strong);
    }
}
