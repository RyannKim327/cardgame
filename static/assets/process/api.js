export default function api(url = "http://localhost:3000", headers = {}) {
	if (url.endsWith("/")) {
		url = url.slice(0, -1)
	}

	async function get(endpoint, params) {
		if (!endpoint.startsWith("/")) {
			endpoint = `/${endpoint}`
		}

		let fullUrl = `${url}${endpoint}`
		if (params) {
			const searchParams = new URLSearchParams(params)
			fullUrl += `?${searchParams.toString()}`
		}
		try {
			const response = await fetch(fullUrl, {
				method: "GET",
				headers: headers
			}).then(r => r.json())

			return response
		} catch (e) {
			return {
				error: e
			}
		}
	}

	async function post(endpoint, data, params) {
		if (!endpoint.startsWith("/")) {
			endpoint = `/${endpoint}`
		}

		let fullUrl = `${url}${endpoint}`
		if (params) {
			const searchParams = new URLSearchParams(params)
			fullUrl += `?${searchParams.toString()}`
		}
		try {
			const response = await fetch(fullUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...headers
				},
				body: JSON.stringify(data)
			}).then(r => r.json())

			return response
		} catch (e) {
			return {
				error: e
			}
		}
	}

	return {
		get, post
	}
}
