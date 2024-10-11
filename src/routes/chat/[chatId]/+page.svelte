<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import markdownit from 'markdown-it';

	export let data: PageData;

	let messages = data.messages;
	let inputMessage = '';
	let chatContainer;
	let chats = data.chats;
	let currentChatId = $page.params.chatId;
	let md = markdownit();

	$: currentChatId = $page.params.chatId;

	// Add this reactive statement to update messages when the chat changes
	$: {
		if (data.messages) {
			messages = data.messages;
		}
	}

	async function createNewChat() {
		const response = await fetch('/api/createChat', {
			method: 'POST'
		});
		const newChat = await response.json();
		chats = [...chats, newChat];
		goto(`/chat/${newChat.id}`);
	}

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
					body: JSON.stringify({ message: userMessage, chatId: currentChatId })
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

	afterUpdate(() => {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});

	// Remove this reactive statement as it's now handled in afterUpdate
	// $: if (chatContainer) {
	// 	chatContainer.scrollTop = chatContainer.scrollHeight;
	// }
</script>

<svelte:head>
	<title>Chat</title>
</svelte:head>

<div class="flex max-w-6xl mx-auto">
	<div class="w-1/4 pr-4">
		<ul class="space-y-2">
			{#each chats as chat}
				<li>
					<a
						href="/chat/{chat.id}"
						class="block p-2 rounded {$page.params.chatId === chat.id
							? 'bg-blue-600'
							: 'bg-gray-700'} hover:bg-blue-500"
					>
						{chat.id}
					</a>
				</li>
			{/each}
		</ul>
		<button
			on:click={createNewChat}
			class="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
		>
			New Chat
		</button>
	</div>
	<div class="w-3/4">
		<div
			bind:this={chatContainer}
			class="bg-gray-800 rounded-lg p-4 h-[60vh] overflow-y-auto mb-4 custom-scrollbar"
		>
			{#each messages as message}
				<div class="mb-4 {message.isUser ? 'text-right' : 'text-left'}">
					<div
						class="inline-block max-w-[70%] p-3 rounded-lg {message.isUser
							? 'bg-blue-600 text-white'
							: 'bg-gray-700 text-gray-200'}"
					>
						<div class="prose dark:prose-invert prose-sm">
							{@html md.render(message.text)}
						</div>
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
</div>

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: #4a5568 #2d3748;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #2d3748;
		border-radius: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #4a5568;
		border-radius: 10px;
		border: 3px solid #2d3748;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: #718096;
	}
</style>
