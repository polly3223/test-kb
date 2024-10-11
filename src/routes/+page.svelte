<script lang="ts">
	// Remove the import and navigateToCreateKB function
</script>

<svelte:head>
	<title>AI-Powered Knowledge Base Management</title>
</svelte:head>

<!-- Hero Section -->
<div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
	<div class="max-w-4xl mx-auto px-4 text-center">
		<h1 class="text-5xl font-bold mb-4">Effortless Knowledge Management with AI</h1>
		<p class="text-xl mb-8">Organize, retrieve, and interact with your data seamlessly</p>
		<a
			href="/createKb"
			class="inline-block px-8 py-4 bg-white text-blue-600 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors duration-200 text-lg font-semibold"
		>
			Get Started
		</a>
	</div>
</div>

<div class="max-w-6xl mx-auto px-4 py-16">
	<div class="space-y-16">
		<section>
			<h2 class="text-3xl font-semibold mb-8 text-blue-400 text-center">What We Offer</h2>
			<p class="text-xl text-gray-300 text-center max-w-3xl mx-auto">
				Our project allows you to add knowledge bases in a hosted way to an AI, enabling automatic
				organization and retrieval of information. With our system, you can effortlessly create,
				manage, and interact with custom knowledge bases through natural language conversations.
			</p>
		</section>

		<section>
			<h2 class="text-3xl font-semibold mb-8 text-blue-400 text-center">How It Works</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
				<div class="bg-gray-800 rounded-lg p-6 shadow-lg">
					<div class="text-4xl text-blue-400 mb-4">1</div>
					<h3 class="text-xl font-semibold mb-2 text-blue-300">Create a Knowledge Base</h3>
					<p class="text-gray-300">
						Define your custom fields and structure using our intuitive interface.
					</p>
				</div>
				<div class="bg-gray-800 rounded-lg p-6 shadow-lg">
					<div class="text-4xl text-blue-400 mb-4">2</div>
					<h3 class="text-xl font-semibold mb-2 text-blue-300">AI Integration</h3>
					<p class="text-gray-300">
						Our system automatically generates AI tools for inserting, deleting, and retrieving
						data.
					</p>
				</div>
				<div class="bg-gray-800 rounded-lg p-6 shadow-lg">
					<div class="text-4xl text-blue-400 mb-4">3</div>
					<h3 class="text-xl font-semibold mb-2 text-blue-300">Chat Interaction</h3>
					<p class="text-gray-300">
						Communicate with the AI to read and write data to your knowledge base effortlessly.
					</p>
				</div>
				<div class="bg-gray-800 rounded-lg p-6 shadow-lg">
					<div class="text-4xl text-blue-400 mb-4">4</div>
					<h3 class="text-xl font-semibold mb-2 text-blue-300">Data Management</h3>
					<p class="text-gray-300">
						Easily view and edit your knowledge base data through a user-friendly table interface.
					</p>
				</div>
			</div>
		</section>

		<section>
			<h2 class="text-3xl font-semibold mb-8 text-blue-400 text-center">Use Cases</h2>
			<ul class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
				<li class="flex items-center">
					<span class="text-blue-400 mr-2">•</span> Automatically organize resumes and candidate information
				</li>
				<li class="flex items-center">
					<span class="text-blue-400 mr-2">•</span> Create a personal CRM system with minimal effort
				</li>
				<li class="flex items-center">
					<span class="text-blue-400 mr-2">•</span> Organize and retrieve scattered information from
					various sources
				</li>
				<li class="flex items-center">
					<span class="text-blue-400 mr-2">•</span> Build data collection apps for receipts, car information,
					or market analysis
				</li>
				<li class="flex items-center">
					<span class="text-blue-400 mr-2">•</span> Manage and query personal or professional contacts
				</li>
				<li class="flex items-center">
					<span class="text-blue-400 mr-2">•</span> Effortlessly maintain to-do lists, grocery lists,
					and more
				</li>
			</ul>
		</section>

		<section class="text-center">
			<h2 class="text-3xl font-semibold mb-4 text-blue-400">Get Started</h2>
			<p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
				Ready to harness the power of AI-driven knowledge management? Create your first knowledge
				base now and experience the future of information organization.
			</p>
			<a
				href="/createKb"
				class="inline-block px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 text-xl font-semibold"
			>
				Create Knowledge Base
			</a>
		</section>
	</div>
</div>
