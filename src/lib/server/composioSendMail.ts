import { SECRET_COMPOSIO_TOKEN, SECRET_OPENAI_API_KEY } from '$env/static/private';
import { Composio } from 'composio-core';
import { OpenAIToolSet } from 'composio-core';
import OpenAI from 'openai';

export async function createEvent() {
	const openai = new OpenAI({ apiKey: SECRET_OPENAI_API_KEY });

	const composioToolset = new OpenAIToolSet({
		apiKey: SECRET_COMPOSIO_TOKEN,
		entityId: 'LorenzoTest'
	});

	const tools = await composioToolset.getTools({
		actions: ['GOOGLECALENDAR_CREATE_EVENT']
	});

	const completion = await openai.chat.completions.create({
		model: 'gpt-4o',
		messages: [
			{
				role: 'user',
				content: `Now is ${new Date().toISOString()}. Please create an event in my calendar for tomorrow at 5PM with the title "Meeting with John Doe" and the description "Discuss project proposal".`
			}
		],
		tools,
		tool_choice: 'auto'
	});

	const msg = completion.choices[0].message;

	if (msg.tool_calls) {
		console.log(msg.tool_calls[0].function.name);
		await composioToolset.handleToolCall(completion);
	}
}

export async function authCalendar() {
	const client = new Composio(SECRET_COMPOSIO_TOKEN);
	const connection = await client.getEntity('LorenzoTest').initiateConnection('googlecalendar');
	console.log(connection.redirectUrl);
}
