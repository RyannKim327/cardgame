export async function api(url, headers) {
	if (!url) {
		url = "http://localhost:3000"
	}

	if (url.endsWith("/")) {
		url = url.subString(0, url, length - 1)
	}

	async function get(endpoint, params) {
		if (!endpoint.startsWith("/")) {
			endpoint = `/${endpoint}`
		}

		const response = await fetch(endpoint, {
			method: "GET",
			params: params,
			headers: headers
		}).then(r => r.json())

		return response
	}

	async function post(endpoint, data, params) {
		if (!endpoint.startsWith("/")) {
			endpoint = `/${endpoint}`
		}

		const response = await fetch(endpoint, {
			method: "POST",
			params: params,
			headers: headers,
			body: JSON.stringify(data)
		}).then(r => r.json())

		return response
	}
	return {
		get, post
	}
}
