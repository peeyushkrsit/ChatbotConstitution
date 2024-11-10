document.getElementById('user-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const userInput = e.target.value.trim();
        addMessageToChat('user', userInput); // Display user message in chat
        console.log("User input:", userInput); // Log user input for debugging

        // Make a POST request to the server with the user input
        fetch('http://localhost:3000/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input: userInput })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Bot response:", data.response);
            addMessageToChat('bot', data.response);
        })
        .catch(error => {
            console.error("Error:", error);
            addMessageToChat('bot', "There was an error processing your request.");
        });

        // Clear the input field after submitting
        e.target.value = '';
    }
});

function addMessageToChat(sender, message) {
    const chatDiv = document.getElementById('chatbot');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.textContent = message;
    chatDiv.appendChild(messageElement);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}