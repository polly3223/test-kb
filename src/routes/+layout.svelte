<script>
	import '../app.css';
</script>

<header class="bg-gray-800 text-white p-4">
	<nav class="container mx-auto flex justify-between items-center">
		<a href="/" class="text-xl font-bold">KB Manager</a>
		<ul class="flex space-x-4">
			<li><a href="/createKb" class="hover:text-gray-300">Create KB</a></li>
			<li><a href="/listKb" class="hover:text-gray-300">List KB</a></li>
			<li><a href="/chat" class="hover:text-gray-300">Chat</a></li>
		</ul>
	</nav>
</header>

<div class="pt-8">
	<slot />
</div>
