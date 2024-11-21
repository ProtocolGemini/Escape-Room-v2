import { Game } from './game.js';

export class RoomManager {
    constructor(game) {
        this.game = game;
        this.currentRoom = null;
        this.rooms = {
            lab: {
                name: 'Research Laboratory',
                description: 'A dimly lit laboratory filled with vintage computer equipment and mysterious research apparatus. A large mainframe computer blinks steadily in the corner.',
                items: ['keycard', 'research_notes'],
                exits: ['hallway'],
                examine: {
                    mainframe: 'A CDC 6600 mainframe computer. The screen displays: "ENTER ACCESS CODE:"',
                    desk: 'A wooden desk with several drawers. One is slightly ajar.',
                    drawer: 'A partially open drawer. Something glints inside.',
                    research_notes: 'A classified document marked TOP SECRET.'
                },
                puzzles: {
                    mainframe: {
                        solved: false,
                        solution: '53815',
                        hint: 'Look at the research notes carefully. The key might be in the project name...'
                    }
                }
            }
        };
        this.initRoom('lab');
    }

    initRoom(roomId) {
        if (this.rooms[roomId]) {
            this.currentRoom = this.rooms[roomId];
            this.setupRoomVisuals();
            return this.currentRoom.description;
        }
        return 'Error: Room not found';
    }

    setupRoomVisuals() {
        const roomView = document.getElementById('room-view');
        roomView.innerHTML = '';
        
        const roomElement = document.createElement('div');
        roomElement.className = `room ${this.currentRoom.name.toLowerCase().replace(/\s+/g, '_')}`;
        
        // Create desk
        const desk = document.createElement('div');
        desk.className = 'desk';
        
        const deskMain = document.createElement('div');
        deskMain.className = 'desk-main';
        
        // Add desk top and legs
        const deskTop = document.createElement('div');
        deskTop.className = 'desk-top';
        deskMain.appendChild(deskTop);
        
        const leftLeg = document.createElement('div');
        leftLeg.className = 'desk-legs left';
        const rightLeg = document.createElement('div');
        rightLeg.className = 'desk-legs right';
        
        deskMain.appendChild(leftLeg);
        deskMain.appendChild(rightLeg);
        desk.appendChild(deskMain);
        
        // Create terminal with keyboard
        const terminal = document.createElement('div');
        terminal.className = 'interactive terminal';
        terminal.innerHTML = `
            <div class="terminal-screen">
                <img src="/souken-logo.svg" alt="Souken Industries" class="terminal-logo">
            </div>
            <div class="terminal-keyboard"></div>
        `;
        terminal.addEventListener('click', () => this.handleInteraction('mainframe'));
        deskMain.appendChild(terminal);
        
        // Create filing cabinet
        const filingCabinet = document.createElement('div');
        filingCabinet.className = 'filing-cabinet';
        
        // Create drawers
        for (let i = 0; i < 5; i++) {
            const drawer = document.createElement('div');
            drawer.className = 'drawer' + (i === 2 ? ' drawer-open' : '');
            if (i === 2) {
                drawer.addEventListener('click', () => {
                    if (this.currentRoom.items.includes('keycard')) {
                        this.handleInteraction('keycard');
                        this.game.audioManager.playSound('beep');
                    }
                });
            }
            filingCabinet.appendChild(drawer);
        }
        
        desk.appendChild(filingCabinet);
        roomElement.appendChild(desk);
        
        // Add research notes
        if (this.currentRoom.items.includes('research_notes')) {
            const notes = document.createElement('div');
            notes.className = 'interactive document';
            notes.addEventListener('click', () => this.handleInteraction('research_notes'));
            roomElement.appendChild(notes);
        }
        
        // Add help box
        const helpBox = document.createElement('div');
        helpBox.className = 'help-box';
        helpBox.innerHTML = `
            <h3>Commands</h3>
            <ul>
                <li><code>look</code> - Examine the room</li>
                <li><code>examine [object]</code> - Look at something closely</li>
                <li><code>take [item]</code> - Pick up an item</li>
                <li><code>use [item]</code> - Use an item</li>
                <li><code>inventory</code> - Check your items</li>
                <li><code>go [direction]</code> - Move to another room</li>
            </ul>
            <h3>How to Play</h3>
            <p>Type commands in the terminal below to interact with the environment. Click objects to examine them. Collect items and solve puzzles to escape the facility.</p>
        `;
        roomElement.appendChild(helpBox);
        
        roomView.appendChild(roomElement);
    }

    handleInteraction(itemId) {
        if (itemId === 'mainframe') {
            this.showTerminalPopup();
        } else if (itemId === 'keycard' && this.currentRoom.items.includes('keycard')) {
            this.game.parser.take('keycard');
        } else if (itemId === 'research_notes' && this.currentRoom.items.includes('research_notes')) {
            this.game.parser.examine('research_notes');
        }
    }

    showTerminalPopup() {
        const popup = document.createElement('div');
        popup.className = 'terminal-popup';
        popup.innerHTML = `
            <div class="terminal-header">SOUKEN INDUSTRIES MAINFRAME</div>
            <div class="terminal-content">
                <div>SECURITY SYSTEM ACTIVE</div>
                <div>ENTER ACCESS CODE:</div>
                <input type="text" class="terminal-input" maxlength="10" autocomplete="off">
                <div class="terminal-error"></div>
                <div class="terminal-buttons">
                    <button class="terminal-button" data-action="submit">SUBMIT</button>
                    <button class="terminal-button" data-action="cancel">CANCEL</button>
                </div>
            </div>
        `;

        const input = popup.querySelector('.terminal-input');
        const error = popup.querySelector('.terminal-error');
        
        const handleSubmit = () => {
            const code = input.value.trim();
            if (code === this.currentRoom.puzzles.mainframe.solution) {
                this.currentRoom.puzzles.mainframe.solved = true;
                this.game.displayMessage('ACCESS GRANTED. Security doors unlocked.');
                this.game.state.solvePuzzle('mainframe');
                this.game.audioManager.playSound('success');
                popup.remove();
            } else {
                error.textContent = 'ACCESS DENIED. Invalid code.';
                this.game.audioManager.playSound('error');
                input.value = '';
            }
        };

        popup.querySelector('[data-action="submit"]').addEventListener('click', handleSubmit);
        popup.querySelector('[data-action="cancel"]').addEventListener('click', () => popup.remove());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });

        document.body.appendChild(popup);
        input.focus();
    }

    getCurrentRoom() {
        return this.currentRoom;
    }

    getCurrentRoomDescription() {
        return this.currentRoom.description;
    }
}