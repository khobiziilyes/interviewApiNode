import { FastifyRequest, FastifyReply } from "fastify";
const https = require('https');

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
	const name: string = request.params['name']?.trim();
	
	reply.headers['Accept'] = 'application/json';
	
	if (!name) {
		reply.code(404);
		reply.send("Pokemon name is invalid.");

		return reply;
	}

	const urlApiPokeman = `https://pokeapi.co/api/v2/pokemon/${name}`;
	
	try {
		const response: any = await httpGet(urlApiPokeman);

		await computeResponse(response);
	
		reply.send(response);
	} catch (e) {
		reply.code(404);
		reply.send("Pokemon doesn't exist.");
	}
	
	return reply;
}

export const computeResponse = async ({ types, stats }) => {	
	const pokemonTypes = [];

	for (let pokemonType of types.map(_ => _.type)) {
		const statResponse = await httpGet(pokemonType.url);
		pokemonTypes.push(statResponse);
	}

	// The goal you are trying to achieve here isn't clear.
	
	/* stats.forEach(element => {
		var stats = []
	
		pokemonTypes.map(pok =>
			pok.stats.map(st =>
				st.stat.name.toUpperCase() == element.stat.name
					? stats.push(st.base_state)
					: ([])
			)
		)
	
		if (stats) {
		  let avg = stats.reduce((a, b) => a + b) / stats.length
		  element.averageStat = avg
		} else {
		  element.averageStat = 0
		}
	}); */
}

const httpGet = url => {
	return new Promise((resolve, reject) => {
		const req = https.get(url, res => {
			if (res.statusCode < 200 || res.statusCode >= 300) return reject();
			
			res.setEncoding('utf8');
			
			let body = ''; 
			
			res.on('data', chunk => body += chunk);
			
			res.on('end', () =>
				resolve(JSON.parse(body))
			);
		}).on('error', reject);
	});
}