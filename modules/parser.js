export class Parser {
    constructor(game) {
        this.game = game;
        this.commands = {
            look: this.look.bind(this),
            examine: this.examine.bind(this),
            take: this.take.bind(this),
            use: this.use.bind(this),
            inventory: this.inventory.bind(this),
            go: this.go.bind(this),
            help: this.help.bind(this)
        };
        this.commandHistory = [];
        this.historyIndex = -1;
        this.setupInputHandler();
    }

    setupInputHandler() {
        const input = document.getElementById('command-input');
        const history = document.getElementById('command-history');

        input.setAttribute('placeholder', 'TYPE YOUR COMMAND HERE...');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                const command = input.value.trim();
                this.addToHistory('user', command);
                this.parse(command);
                input.value = '';
                this.historyIndex = -1;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up', input);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down', input);
            }
        });

        // Add input suggestions
        input.addEventListener('input', () => {
            const value = input.value.toLowerCase();
            if (value) {
                this.showSuggestions(value);
            } else {
                this.hideSuggestions();
            }
        });

        // Clear suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#parser')) {
                this.hideSuggestions();
            }
        });
    }

    navigateHistory(direction, input) {
        if (this.commandHistory.length === 0) return;

        if (direction === 'up') {
            this.historyIndex = Math.min(
                this.historyIndex + 1,
                this.commandHistory.length - 1
            );
        } else {
            this.historyIndex = Math.max(this.historyIndex - 1, -1);
        }

        if (this.historyIndex === -1) {
            input.value = '';
        } else {
            const entry = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
            if (entry.type === 'user') {
                input.value = entry.text;
            }
        }
    }

    showSuggestions(value) {
        const suggestions = Object.keys(this.commands).filter(cmd => 
            cmd.startsWith(value) && cmd !== value
        );

        let suggestionsDiv = document.querySelector('.command-suggestions');
        if (!suggestionsDiv) {
            suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'command-suggestions';
            document.getElementById('parser').appendChild(suggestionsDiv);
        }

        if (suggestions.length > 0) {
            suggestionsDiv.innerHTML = suggestions
                .map(cmd => `<div class="suggestion">${cmd}</div>`)
                .join('');
            suggestionsDiv.classList.add('visible');

            // Add click handlers for suggestions
            suggestionsDiv.querySelectorAll('.suggestion').forEach(sug => {
                sug.addEventListener('click', () => {
                    document.getElementById('command-input').value = sug.textContent;
                    this.hideSuggestions();
                });
            });
        } else {
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        const suggestions = document.querySelector('.command-suggestions');
        if (suggestions) {
            suggestions.classList.remove('visible');
        }
    }

    addToHistory(type, text) {
        const entry = { type, text, timestamp: new Date() };
        this.commandHistory.push(entry);
        
        const history = document.getElementById('command-history');
        const div = document.createElement('div');
        div.className = `command-entry ${type}`;
        
        if (type === 'user') {
            div.textContent = `> ${text}`;
        } else {
            div.textContent = text;
        }
        
        history.appendChild(div);
        history.scrollTop = history.scrollHeight;
    }

    parse(input) {
        const [command, ...args] = input.toLowerCase().split(' ');
        const action = this.commands[command];
        
        if (action) {
            action(args.join(' '));
        } else {
            this.addToHistory('error', "I don't understand that command.");
            this.game.audioManager.playSound('error');
        }
    }

    // Command implementations
    look() {
        const description = this.game.getCurrentRoom().getDescription();
        this.addToHistory('system', description);
    }

    examine(target) {
        const room = this.game.getCurrentRoom();
        if (room.examine[target]) {
            this.addToHistory('system', room.examine[target]);
        } else {
            this.addToHistory('system', "There's nothing special about that.");
        }
    }

    take(item) {
        const room = this.game.getCurrentRoom();
        const takenItem = room.takeItem(item);
        
        if (takenItem) {
            this.game.inventory.addItem(takenItem);
            this.addToHistory('system', `Taken: ${item}`);
            this.game.audioManager.playSound('success');
        } else {
            this.addToHistory('error', "You can't take that.");
            this.game.audioManager.playSound('error');
        }
    }

    use(item) {
        const room = this.game.getCurrentRoom();
        if (room.puzzles && room.puzzles[item]) {
            this.addToHistory('system', `Using: ${item}`);
        } else {
            this.addToHistory('error', "You can't use that here.");
            this.game.audioManager.playSound('error');
        }
    }

    inventory() {
        const items = this.game.inventory.getItems();
        if (items.length > 0) {
            this.addToHistory('system', `You are carrying: ${items.join(', ')}`);
        } else {
            this.addToHistory('system', 'You are not carrying anything.');
        }
    }

    go(direction) {
        const room = this.game.getCurrentRoom();
        if (room.exits.includes(direction)) {
            const description = this.game.roomManager.loadRoom(direction);
            this.addToHistory('system', description);
        } else {
            this.addToHistory('error', "You can't go that way.");
            this.game.audioManager.playSound('error');
        }
    }

    help() {
        this.addToHistory('system', `Available commands:
- look: Examine the room
- examine [object]: Look at something closely
- take [item]: Pick up an item
- use [item]: Use an item
- inventory: Check your items
- go [direction]: Move to another room
- help: Show this help message`);
    }
}