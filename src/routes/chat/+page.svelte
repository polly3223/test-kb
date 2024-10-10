<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let messages = data.messages;
	let inputMessage = '';
	let chatContainer;

	async function sendMessage() {
		if (inputMessage.trim()) {
			messages = [...messages, { text: inputMessage, isUser: true }];
			const userMessage = inputMessage;
			inputMessage = '';

			try {
				const response = await fetch('/api/sendMessage', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ message: userMessage })
				});

				if (!response.ok) {
					throw new Error('Failed to send message');
				}

				const data = await response.json();
				messages = [...messages, { text: data.assistantMessage, isUser: false }];
			} catch (error) {
				console.error('Error sending message:', error);
				messages = [...messages, { text: 'Error: Failed to send message', isUser: false }];
			}
		}
	}

	onMount(() => {
		chatContainer.scrollTop = chatContainer.scrollHeight;
	});

	$: if (chatContainer) {
		chatContainer.scrollTop = chatContainer.scrollHeight;
	}
</script>

<svelte:head>
	<title>Chat</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
	<h1 class="text-4xl font-bold mb-8 text-blue-400">Chat</h1>

	<div bind:this={chatContainer} class="bg-gray-800 rounded-lg p-4 h-[60vh] overflow-y-auto mb-4">
		{#each messages as message}
			<div class="mb-4 {message.isUser ? 'text-right' : 'text-left'}">
				<div
					class="inline-block max-w-[70%] p-3 rounded-lg {message.isUser
						? 'bg-blue-600 text-white'
						: 'bg-gray-700 text-gray-200'}"
				>
					{message.text}
				</div>
			</div>
		{/each}
	</div>

	<div class="flex">
		<input
			type="text"
			bind:value={inputMessage}
			on:keypress={(e) => e.key === 'Enter' && sendMessage()}
			placeholder="Type your message..."
			class="flex-grow bg-gray-800 text-gray-100 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button
			on:click={sendMessage}
			class="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors duration-200"
		>
			Send
		</button>
	</div>
</div>
