/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI} from '@google/genai';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// ===================================================================================
// SCRIPT 1: UTILS.JS
// ===================================================================================
const Utils = {
    getRandomQuote(category) {
        if (Content && Content.quotes && Content.quotes[category]) {
            const quotes = Content.quotes[category];
            return quotes[Math.floor(Math.random() * quotes.length)];
        }
        return "Hláška nenalezena.";
    },
    saveData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("Chyba při ukládání dat do localStorage:", e);
        }
    },
    loadData(key, defaultValue) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error("Chyba při načítání dat z localStorage:", e);
            return defaultValue;
        }
    },
    vibrate(pattern) {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                console.warn("Haptická odezva selhala:", e);
            }
        }
    }
};

// ===================================================================================
// SCRIPT 2: ASSETS.JS (s novými SVG pro herní objekty)
// ===================================================================================
const Assets = {
    icons: {
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>`,
        pause: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`,
        settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17-.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24-.42.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l-.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg>`,
        leaderboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11V3H8v8H2v10h20V11h-6zm-6-6h4v14h-4V5zm-6 6h4v8H4v-8zm16 8h-4v-8h4v8z"></path></svg>`,
        view_in_ar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.1,2.39L4.5,6.73V15.27L12.1,19.61L19.7,15.27V6.73L12.1,2.39M11,14.65V10.23L6.5,12.44L11,14.65M13,10.23V14.65L17.5,12.44L13,10.23M18.6,11.27L12.1,15L5.6,11.27L12.1,7.5L18.6,11.27Z"></path></svg>`,
        back_arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>`,
        toggle_collision: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"/><path d="M12.5 12.05L15.25 9.3l-1.41-1.41L11.09 10.64l-2.83-2.83-1.41 1.41L9.68 12.05l-2.83 2.83 1.41 1.41 2.83-2.83 2.75 2.75 1.41-1.41z" opacity=".3"/></svg>`,

        // In-game icons pro HUD
        drug_pill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.75 3c-3.23 0-5.93 2.1-6.75 5H4v2h7.11c.15.32.32.63.51.93l-3.57 3.57c-.39.39-.39 1.02 0 1.41l2.12 2.12c.39.39 1.02.39 1.41 0l3.57-3.57c.3.19.61.36.93.51V20h2v-7.01c2.9-.82 5-3.52 5-6.74C23 4.23 20.64 3 17.75 3zm0 2c1.79 0 3.25 1.93 3.25 4.25S19.54 13.5 17.75 13.5s-3.25-1.93-3.25-4.25S15.96 5 17.75 5z"/></svg>`,
        syringe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" transform="rotate(45)"><path d="M19 3h-1V2h-2v1h-1c-1.1 0-2 .9-2 2v1H2v2h11v1c0 .83-.67 1.5-1.5 1.5H11v2h.5c.28 0 .5.22.5.5V16h-1v2h1v1h2v-1h1v-2h-1v-1.5c0-.28.22-.5.5-.5H13v-2h-.5c-.83 0-1.5-.67-1.5-1.5V9h7V7h-7V5c0-.55.45-1 1-1h1V2h2v1h1v2h-1v2h-2V5h-1c-.55 0-1 .45-1 1v1h2v2h-2v1.68c.84.32 1.5.98 1.5 1.82v2h2v-2h2v-2h-2v-2h-2V7h2V5h2V3z"/></svg>`,
        
        player_fofr_pedro: `
            <svg viewBox="0 0 70 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="jacketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#4f46e5;"/>
                        <stop offset="100%" style="stop-color:#312e81;"/>
                    </linearGradient>
                </defs>
                <g>
                    <!-- Legs -->
                    <path d="M 20 98 L 30 70 L 35 70 L 25 98 Z" fill="#171717"/>
                    <path d="M 50 98 L 40 70 L 35 70 L 45 98 Z" fill="#171717"/>
                    <!-- Body / Jacket -->
                    <path d="M 15 35 L 55 35 L 65 75 L 5 75 Z" fill="url(#jacketGradient)" />
                    <path d="M 35 35 V 75" stroke="#fde047" stroke-width="3" />
                    <path d="M 15 35 C 25 50, 25 60, 15 70" fill="none" stroke="#222" stroke-width="2" opacity="0.5"/>
                    <path d="M 55 35 C 45 50, 45 60, 55 70" fill="none" stroke="#222" stroke-width="2" opacity="0.5"/>
                    <!-- Head & Cap -->
                    <path d="M 25 10 L 45 10 L 55 20 L 15 20 Z" fill="#171717"/>
                    <circle cx="35" cy="20" r="15" fill="#ffedd5"/>
                    <path d="M 20 20 A 15 15 0 0 1 50 20" fill="#292524"/>
                    <!-- Face -->
                    <path d="M 30 22 Q 35 25 40 22" stroke="black" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </g>
            </svg>`,

        lajna_matro: `
            <svg viewBox="0 0 50 20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="neon-glow-lajna">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"></feGaussianBlur>
                        <feFlood flood-color="white" result="glowColor"></feFlood>
                        <feComposite in="glowColor" in2="blur" operator="in" result="glow"></feComposite>
                        <feMerge>
                            <feMergeNode in="glow"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                    </filter>
                </defs>
                <g filter="url(#neon-glow-lajna)">
                    <path d="M5 10 H45" stroke="white" stroke-width="5" stroke-linecap="round"/>
                    <circle cx="5" cy="10" r="3" fill="var(--neon-blue)"/>
                    <circle cx="45" cy="10" r="3" fill="var(--neon-blue)"/>
                </g>
            </svg>`,

        cevko_syringe: `
            <svg viewBox="0 0 30 60" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="neon-glow-cevko">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"></feGaussianBlur>
                        <feFlood flood-color="red" result="glowColor"></feFlood>
                        <feComposite in="glowColor" in2="blur" operator="in" result="glow"></feComposite>
                        <feMerge>
                            <feMergeNode in="glow"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                    </filter>
                </defs>
                <g filter="url(#neon-glow-cevko)">
                    <rect x="10" y="5" width="10" height="40" rx="5" ry="5" fill="rgba(255,0,0,0.5)" stroke="red" stroke-width="3"/>
                    <path d="M15 45 L15 55 M15 55 L10 50 M15 55 L20 50" stroke="red" stroke-linecap="round" stroke-width="3"/>
                </g>
            </svg>`,

        policajt_chase: `
            <svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
                 <g>
                    <!-- Visor -->
                    <path d="M 10 10 L 50 10 L 45 25 L 15 25 Z" fill="#00f6ff" opacity="0.8"/>
                     <!-- Helmet -->
                    <path d="M 5 20 L 55 20 A 25 25 0 0 1 5 20" fill="#1e3a8a" stroke="#00f6ff" stroke-width="2"/>
                    <!-- Body -->
                    <rect x="15" y="35" width="30" height="30" fill="#3b82f6" rx="5"/>
                    <rect x="20" y="30" width="20" height="10" fill="#1e3a8a"/>
                 </g>
            </svg>`,

        auto_prekazka: `
            <svg viewBox="0 0 80 45" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <!-- Car Body -->
                    <path d="M 5 20 L 15 5 H 65 L 75 20 L 70 35 H 10 Z" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
                    <!-- Window -->
                    <path d="M 20 8 H 60 L 55 18 H 25 Z" fill="#00f6ff" opacity="0.5"/>
                    <!-- Red light bar -->
                    <path d="M 5 20 L 75 20" stroke="#f87171" stroke-width="4" filter="url(#neon-glow-auto)"/>
                    <defs>
                        <filter id="neon-glow-auto">
                            <feGaussianBlur stdDeviation="3" />
                        </filter>
                    </defs>
                </g>
            </svg>`
    }
};

// ===================================================================================
// SCRIPT 3: CONTENT.JS
// ===================================================================================
const Content = {
    quotes: {
        start: ["Jdeme na to, kámo!","Dneska to bude jízda!","Hlavně nenápadně...","Potřebuju na vlakáč!"],
        collect: ["Dobrý matroš!","Tohle zachrání večer!","Čistá práce!","Kvalitka z Dejvic."],
        health: ["Extra život se hodí!","Ještě nejsem na odpis!","Tohle mě postaví na nohy.","Zdravíčko!"],
        damage: ["Prásknul ses!","Tohle bolí víc než absťák!","Do prdele, fízlové!","Bacha, díra!"],
        gameOver: ["Chytli tě, šlehaři!","Příště běž jinudy!", "Konec jízdy, kámo.", "Game over, smažko."]
    }
};

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

async function getAIGeneratedQuote() {
    try {
        const prompt = `Generate a short, witty, satirical, and slightly dark-humored game over message in Czech for a game called 'Fofr Pedro'. The game is about a character running through a neon-drenched Prague, collecting items and avoiding futuristic police. The tone is cyberpunk and sarcastic. The message should be 1-2 sentences. Examples of existing quotes are: "Chytli tě, šlehaři!", "Příště běž jinudy!", "Konec jízdy, kámo."`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text.trim();
        // Basic validation for the generated text
        if (text && text.length > 5) {
            return text;
        } else {
             // Fallback if response is too short or empty
            return Utils.getRandomQuote('gameOver');
        }

    } catch (error) {
        console.error("Error generating AI quote:", error);
        // Fallback to a default quote if AI fails
        return Utils.getRandomQuote('gameOver');
    }
}


// ===================================================================================
// SCRIPT 4: GAME.JS
// ===================================================================================
window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const gameContainer = document.getElementById('game-container');
    const mainMenu = document.getElementById('main-menu');
    const pauseMenu = document.getElementById('pause-menu');
    const gameOverScreen = document.getElementById('game-over-screen');
    const hud = document.getElementById('hud');
    const startButton = document.getElementById('start-game-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-game-button');
    const restartButton = document.getElementById('restart-game-button');
    const toMenuButton = document.getElementById('main-menu-button');
    const scoreDisplay = document.getElementById('score');
    const healthDisplay = document.getElementById('health');
    const finalScoreDisplay = document.getElementById('final-score');
    const highScoreDisplay = document.getElementById('high-score');
    const gameOverQuoteDisplay = document.getElementById('game-over-quote');
    const messageDisplay = document.getElementById('message-display');
    const scoreHudItem = document.getElementById('score-hud-item');
    const healthHudItem = document.getElementById('health-hud-item');
    
    // 3D Preview Elements
    const previewContainer = document.getElementById('preview-container');
    const previewCanvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
    const showPreviewButton = document.getElementById('show-preview-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const toggleCollisionButton = document.getElementById('toggle-collision-button');
    const modelInfoDisplay = document.getElementById('model-info-display');

    let gameState = 'MENU';
    let score = 0;
    let health = 3;
    let highScore = Utils.loadData('fofrPedroHighScore', 0);
    let gameSpeed = 3;
    const initialGameSpeed = 3;
    const maxGameSpeed = 10;
    let animationFrameId;

    const svgImageCache = {};
    
    const player = {
        x: 0,
        y: 0,
        baseY: 0,
        width: 70,
        height: 100,
        lane: 1,
        lanes: [],
        animationPhase: 0,
        // Jump properties
        isJumping: false,
        jumpVelocity: 0,
        gravity: 0.8,
        rotation: 0,
        draw() {
            const x = this.x;
            const y = this.y;
            drawSvg(ctx, Assets.icons.player_fofr_pedro, x, y, this.width, this.height, 'var(--neon-purple)', this.rotation);
        },
        update() {
            if (this.isJumping) {
                this.jumpVelocity += this.gravity;
                this.y += this.jumpVelocity;
                // New tilt animation based on velocity
                this.rotation = Math.max(-20, Math.min(20, this.jumpVelocity * 1.2)); // Cap rotation at +/- 20 degrees

                if (this.y >= this.baseY) {
                    this.y = this.baseY;
                    this.isJumping = false;
                    this.rotation = 0;
                }
            } else {
                 // Bobbing animation when not jumping
                this.animationPhase += 0.06; // Slightly faster bob
                const bobOffset = Math.sin(this.animationPhase) * 4; // Slightly larger bob
                this.y = this.baseY + bobOffset;
            }

            // Lane movement
            this.lanes = [canvas.width / 4, canvas.width / 2, canvas.width * 3 / 4];
            const targetX = this.lanes[this.lane];
            const ease = 0.2;
            this.x += (targetX - this.x) * ease;
            
            this.draw();
        }
    };

    function drawSvg(ctx, svgString, x, y, width, height, glowColor = null, rotation = 0) {
        if (!svgImageCache[svgString]) {
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
            svgImageCache[svgString] = img;
        }
        
        const img = svgImageCache[svgString];

        ctx.save();
        ctx.translate(x, y - height / 2);
        ctx.rotate(rotation * Math.PI / 180);

        if (glowColor) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (player) {
            player.baseY = canvas.height - 50; // Adjust player ground position
             if (!player.isJumping) {
                player.y = player.baseY;
            }
        }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function renderUIicons() {
        document.getElementById('score-icon').innerHTML = Assets.icons.drug_pill;
        document.getElementById('health-icon').innerHTML = Assets.icons.syringe;
        document.getElementById('pause-button').innerHTML = Assets.icons.pause;
        document.getElementById('play-icon-menu').innerHTML = Assets.icons.play;
        document.getElementById('play-icon-pause').innerHTML = Assets.icons.play;
        document.getElementById('restart-icon-gameover').innerHTML = Assets.icons.play;
        document.getElementById('leaderboard-button').innerHTML = Assets.icons.leaderboard;
        document.getElementById('settings-button').innerHTML = Assets.icons.settings;
        document.getElementById('show-preview-button').innerHTML = Assets.icons.view_in_ar;
        document.getElementById('back-to-menu-button').innerHTML = Assets.icons.back_arrow;
        document.getElementById('toggle-collision-button').innerHTML = Assets.icons.toggle_collision;
    }
    
    let gameObjects = [];
    let roadLines = [];
    let cityBackground = [];
    let dustParticles = [];

    function createDustParticles(count = 50) {
        dustParticles = [];
        for(let i = 0; i < count; i++) {
            dustParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5
            });
        }
    }

    function updateDustParticles() {
        dustParticles.forEach(p => {
            p.y -= p.speed * gameSpeed * 0.1;
            if (p.y < 0) {
                p.y = canvas.height;
                p.x = Math.random() * canvas.width;
            }
            ctx.fillStyle = `rgba(253, 224, 71, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function createRoadLines(numLines = 50) {
        roadLines = [];
        for (let i = 0; i < numLines; i++) {
            roadLines.push({
                y: i * (-canvas.height / numLines),
                height: Math.random() * 20 + 20,
                opacity: Math.random() * 0.3 + 0.1,
                width: Math.random() * 4 + 2
            });
        }
    }

    function updateRoad() {
        roadLines.forEach((line) => {
            line.y += gameSpeed * 1.2;

            ctx.strokeStyle = `rgba(136, 146, 176, ${line.opacity})`;
            ctx.lineWidth = line.width;
            
            const laneWidth = canvas.width / 4;
            [canvas.width / 2 - laneWidth, canvas.width / 2 + laneWidth].forEach(x => {
                ctx.beginPath();
                ctx.moveTo(x, line.y);
                ctx.lineTo(x, line.y - line.height * 0.8);
                ctx.stroke();
            });

            if(line.y > canvas.height + line.height) {
                line.y = -line.height;
            }
        });
    }

    function createCityBackground(numBuildings = 15) {
        cityBackground = [];
        const pragueColors = ["#3b82f6", "#a855f7", "#00f6ff"];
        for (let i = 0; i < numBuildings; i++) {
            const depth = Math.random(); 
            const buildingWidth = (Math.random() * 80 + 40) * (1 - depth * 0.5);
            const buildingHeight = (Math.random() * 200 + 100) * (1 - depth * 0.5);
            const xPos = Math.random() * (canvas.width + buildingWidth) - buildingWidth;
            const color = `hsl(210, 30%, ${Math.floor(10 + depth * 15)}%)`;
            const neonColor = pragueColors[i % pragueColors.length];

            cityBackground.push({
                y: Math.random() * -canvas.height * 2,
                height: buildingHeight,
                width: buildingWidth,
                x: xPos,
                color: color,
                neonColor: neonColor,
                depth: depth 
            });
        }
        cityBackground.sort((a, b) => a.depth - b.depth);
    }

    function updateCityBackground() {
        cityBackground.forEach((bg) => {
            bg.y += gameSpeed * 0.05 * (1 + bg.depth * 2); 

            ctx.fillStyle = bg.color;
            ctx.fillRect(bg.x, bg.y, bg.width, bg.height);

            ctx.fillStyle = bg.neonColor;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(bg.x, bg.y, bg.width, 5);
            ctx.globalAlpha = 1;

            if (bg.y > canvas.height) {
                bg.y = -bg.height - Math.random() * 200;
                bg.x = Math.random() * (canvas.width + bg.width) - bg.width;
            }
        });
    }

    function createGameObject() {
        const types = [
            { type: 'lajna', svg: Assets.icons.lajna_matro, width: 50, height: 20, glow: 'white' },
            { type: 'cevko', svg: Assets.icons.cevko_syringe, width: 30, height: 60, glow: 'red' },
            { type: 'policajt', svg: Assets.icons.policajt_chase, width: 60, height: 70, glow: 'blue' },
            { type: 'auto', svg: Assets.icons.auto_prekazka, width: 80, height: 45, glow: 'red' }
        ];
        const typeObj = types[Math.floor(Math.random() * types.length)];
        const lane = Math.floor(Math.random() * 3);
        
        let newObject = {
            type: typeObj.type,
            svg: typeObj.svg,
            y: -100,
            width: typeObj.width,
            height: typeObj.height,
            lane: lane,
            glowColor: typeObj.glow,
            animationPhase: Math.random() * Math.PI * 2,
            draw() {
                const x = player.lanes[this.lane];
                let y = this.y;
                let width = this.width;
                let height = this.height;

                // Animation logic moved inside switch for per-item tuning
                switch (this.type) {
                    case 'lajna':
                        this.animationPhase += 0.08; // Slower, more graceful wave
                        y += Math.sin(this.animationPhase) * 7; // More pronounced wave
                        break;
                    case 'cevko':
                        this.animationPhase += 0.07; // Slower, more rhythmic pulse
                        const scale = 1 + Math.sin(this.animationPhase) * 0.1; // More noticeable pulse
                        width *= scale;
                        height *= scale;
                        break;
                }

                drawSvg(ctx, this.svg, x, y, width, height, this.glowColor);
            },
            update() {
                this.y += gameSpeed;
                this.draw();
            },
        };
        gameObjects.push(newObject);
    }

    let gameObjectTimer = 0;
    
    function gameLoop() {
        if (gameState !== 'PLAYING') return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateCityBackground(); 
        updateRoad();
        updateDustParticles();

        gameObjectTimer++;
        if (gameObjectTimer > 100 / (gameSpeed / initialGameSpeed)) {
            createGameObject();
            gameObjectTimer = 0;
        }

        gameObjects.forEach((obj, index) => {
            obj.update();
            if ( player.lane === obj.lane && 
                 obj.y + obj.height / 2 > player.y - player.height && 
                 obj.y - obj.height / 2 < player.y &&
                 !(player.isJumping && (obj.type === 'auto' || obj.type === 'policajt'))
               ) {
                handleCollision(obj, index);
            }
            if (obj.y > canvas.height + obj.height) {
                gameObjects.splice(index, 1);
            }
        });
        
        player.update();
        
        gameSpeed = Math.min(maxGameSpeed, gameSpeed + 0.001);
        score += Math.floor(gameSpeed);
        updateHUD();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function handleCollision(obj, index) {
        gameObjects.splice(index, 1);
        Utils.vibrate(50);
        switch (obj.type) {
            case 'lajna': 
                score += 1000; 
                showMessage(Utils.getRandomQuote('collect'));
                pulsateHudItem(scoreHudItem);
                break;
            case 'cevko': 
                health = Math.min(5, health + 1); 
                showMessage(Utils.getRandomQuote('health'));
                pulsateHudItem(healthHudItem);
                break;
            case 'policajt': 
            case 'auto':
                health--;
                showMessage(Utils.getRandomQuote('damage'));
                pulsateHudItem(healthHudItem); 
                if (health <= 0) endGame();
                break;
        }
    }
    
    function pulsateHudItem(itemElement) {
        itemElement.classList.add('pulsate');
        setTimeout(() => {
            itemElement.classList.remove('pulsate');
        }, 400);
    }


    function updateHUD() {
        scoreDisplay.textContent = score.toString();
        healthDisplay.textContent = health.toString();
    }

    function showMessage(text) {
        messageDisplay.textContent = text;
        messageDisplay.classList.add('show');
        setTimeout(() => { messageDisplay.classList.remove('show'); }, 2000);
    }

    function resetGame() {
        score = 0;
        health = 3;
        gameSpeed = initialGameSpeed;
        player.x = canvas.width / 2;
        player.baseY = canvas.height - 50;
        player.y = player.baseY;
        player.lane = 1;
        player.isJumping = false;
        player.rotation = 0;
        gameObjects = [];
        createRoadLines(); 
        createCityBackground();
        createDustParticles();
        updateHUD();
    }

    function startGame() {
        resetGame();
        gameState = 'PLAYING';
        mainMenu.classList.remove('active');
        gameOverScreen.classList.remove('active');
        hud.style.display = 'flex';
        canvas.style.display = 'block';
        gameLoop();
        showMessage(Utils.getRandomQuote('start'));
    }

    function pauseGame() {
        if (gameState !== 'PLAYING') return;
        gameState = 'PAUSED';
        cancelAnimationFrame(animationFrameId);
        pauseMenu.classList.add('active');
    }

    function resumeGame() {
        if (gameState !== 'PAUSED') return;
        gameState = 'PLAYING';
        pauseMenu.classList.remove('active');
        gameLoop();
    }

    async function endGame() {
        gameState = 'GAMEOVER';
        cancelAnimationFrame(animationFrameId);
        Utils.vibrate([100, 50, 100]);
        if (score > highScore) {
            highScore = score;
            Utils.saveData('fofrPedroHighScore', highScore);
        }
        finalScoreDisplay.textContent = score.toString();
        highScoreDisplay.textContent = highScore.toString();
        
        gameOverQuoteDisplay.textContent = "Generuji hlášku...";
        const quote = await getAIGeneratedQuote();
        gameOverQuoteDisplay.textContent = quote;
        
        gameOverScreen.classList.add('active');
        hud.style.display = 'none';
    }

    function showMainMenu() {
        gameState = 'MENU';
        mainMenu.classList.add('active');
        pauseMenu.classList.remove('active');
        gameOverScreen.classList.remove('active');
        hud.style.display = 'none';
        canvas.style.display = 'block';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let lastSwipeUpTime = 0;

    function handleTouchStart(e) { 
        if (gameState !== 'PLAYING') return;
        touchStartX = e.touches[0].clientX; 
        touchStartY = e.touches[0].clientY; 
    }

    function handleTouchEnd(e) {
        if (gameState !== 'PLAYING' || touchStartX === 0) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) { // Horizontal swipe
            if (Math.abs(diffX) > 30) {
                if (diffX > 0) player.lane = Math.min(2, player.lane + 1);
                else player.lane = Math.max(0, player.lane - 1);
            }
        } else { // Vertical swipe
            if (diffY < -50) { // Swipe up
                const now = Date.now();
                if (now - lastSwipeUpTime < 400) { // Double swipe
                    if (!player.isJumping) {
                        player.isJumping = true;
                        player.jumpVelocity = -20;
                        Utils.vibrate(50);
                    }
                }
                lastSwipeUpTime = now;
            }
        }
        touchStartX = 0;
        touchStartY = 0;
    }

    function handleKeyDown(e) {
        if (gameState !== 'PLAYING') return;
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            player.lane = Math.max(0, player.lane - 1);
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            player.lane = Math.min(2, player.lane + 1);
        } else if (e.key === 'ArrowUp' || e.key === ' ') { // Jump with spacebar or up arrow
             if (!player.isJumping) {
                player.isJumping = true;
                player.jumpVelocity = -20;
                e.preventDefault();
            }
        }
    }

    // ===================================================================================
    // SCRIPT 5: 3D PREVIEWER
    // ===================================================================================
    let previewRenderer = null;
    let previewScene = null;
    let previewCamera = null;
    let previewControls = null;
    let previewAnimationId = null;
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let selectedObject = null;
    let originalMaterials = new Map();
    let collisionMeshes = [];
    let audioCtx = null;

    function playSelectSound() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    }

    async function initPreviewScene() {
        if (previewRenderer) return; // Already initialized

        previewRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: previewCanvas });
        previewRenderer.setPixelRatio(window.devicePixelRatio);
        previewRenderer.shadowMap.enabled = true;

        previewScene = new THREE.Scene();
        previewScene.background = new THREE.Color(0x222222);

        previewCamera = new THREE.PerspectiveCamera(60, previewCanvas.width / previewCanvas.height, 0.1, 100);
        previewCamera.position.set(3, 2, 4);
        previewCamera.lookAt(0, 0.8, 0);

        previewControls = new OrbitControls(previewCamera, previewRenderer.domElement);
        previewControls.enableDamping = true;
        previewControls.target.set(0, 0.8, 0);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        hemiLight.position.set(0, 20, 0);
        previewScene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(3, 10, 10);
        dirLight.castShadow = true;
        previewScene.add(dirLight);

        const grid = new THREE.GridHelper(20, 20);
        previewScene.add(grid);

        const loader = new GLTFLoader();
        const models = [
            { path: "/assets/3d/characters/kenney3d_char_pedro.glb", name: "Pedro" },
            { path: "/assets/3d/props/kenney3d_prop_scooter.glb", name: "Scooter" },
            { path: "/assets/3d/props/kenney3d_prop_car01.glb", name: "Car 1 (SUV)" },
            { path: "/assets/3d/props/kenney3d_prop_car02.glb", name: "Car 2 (Racer)" },
            { path: "/assets/3d/env/kenney3d_env_house01.glb", name: "House 1" },
            { path: "/assets/3d/env/kenney3d_env_house02.glb", name: "House 2" },
            { path: "/assets/3d/env/kenney3d_env_tree01.glb", name: "Tree" },
            { path: "/assets/3d/env/kenney3d_env_bush01.glb", name: "Bush" },
            { path: "/assets/3d/env/kenney3d_env_sign01.glb", name: "Sign" },
            { path: "/assets/3d/env/kenney3d_env_trash.glb", name: "Trash" }
        ];

        const numCols = 4;
        const spacing = 3.5;
        const numRows = Math.ceil(models.length / numCols);

        collisionMeshes = [];

        for (const [index, modelInfo] of models.entries()) {
            const col = index % numCols;
            const row = Math.floor(index / numCols);
            const x = (col - (numCols - 1) / 2) * spacing;
            const z = (row - (numRows - 1) / 2) * spacing;

            try {
                const gltf = await loader.loadAsync(modelInfo.path);
                const object = gltf.scene;
                object.position.set(x, 0, z);
                object.userData.name = modelInfo.name;

                object.traverse((child) => {
                    if (child.isMesh) {
                        if (child.name.toLowerCase().includes('_col')) {
                            child.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
                            child.visible = false;
                            collisionMeshes.push(child);
                        } else {
                           originalMaterials.set(child, child.material);
                        }
                    }
                });
                previewScene.add(object);
            } catch (error) {
                console.error(`Failed to load model from ${modelInfo.path}:`, error);
                const placeholder = new THREE.Mesh( new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
                placeholder.position.set(x, 0.5, z);
                previewScene.add(placeholder);
            }
        }
    }
    
    function deselectObject() {
        if (selectedObject) {
            selectedObject.traverse((child) => {
                if (child.isMesh && originalMaterials.has(child)) {
                   child.material = originalMaterials.get(child);
                }
            });
        }
        selectedObject = null;
        modelInfoDisplay.classList.remove('active');
    }

    function selectObject(object) {
        deselectObject();
        selectedObject = object;
        playSelectSound();
        
        selectedObject.traverse((child) => {
            if (child.isMesh && originalMaterials.has(child)) {
                const originalMaterial = originalMaterials.get(child);
                const highlightMaterial = originalMaterial.clone();
                highlightMaterial.emissive = new THREE.Color(0xffff00);
                highlightMaterial.emissiveIntensity = 1;
                child.material = highlightMaterial;
            }
        });

        modelInfoDisplay.textContent = selectedObject.userData.name || 'Unknown Model';
        modelInfoDisplay.classList.add('active');

        // Animation
        selectedObject.userData.scaleStartTime = performance.now();
    }
    
    function onPreviewCanvasClick(event) {
        const rect = previewCanvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, previewCamera);
        const intersects = raycaster.intersectObjects(previewScene.children, true);

        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            while (clickedObject.parent && clickedObject.parent !== previewScene) {
                clickedObject = clickedObject.parent;
            }
            if (clickedObject !== selectedObject) {
                selectObject(clickedObject);
            }
        } else {
            deselectObject();
        }
    }
    
    function startPreviewAnimation() {
        if (previewAnimationId) return;
        function tick(time) {
            previewAnimationId = requestAnimationFrame(tick);
            previewControls.update();
            
            // Pop animation for selected object
            if (selectedObject && selectedObject.userData.scaleStartTime) {
                const elapsedTime = (time - selectedObject.userData.scaleStartTime) / 1000;
                const duration = 0.2;
                if (elapsedTime < duration) {
                    const progress = elapsedTime / duration;
                    const scale = 1 + 0.1 * Math.sin(progress * Math.PI);
                    selectedObject.scale.set(scale, scale, scale);
                } else {
                    selectedObject.scale.set(1, 1, 1);
                    delete selectedObject.userData.scaleStartTime;
                }
            }

            previewRenderer.render(previewScene, previewCamera);
        }
        tick(performance.now());
    }
    
    function stopPreviewAnimation() {
        if (previewAnimationId) {
            cancelAnimationFrame(previewAnimationId);
            previewAnimationId = null;
        }
    }
    
    function toggleCollisionMeshes() {
        if (collisionMeshes.length > 0) {
            const isVisible = !collisionMeshes[0].visible;
            collisionMeshes.forEach(mesh => {
                mesh.visible = isVisible;
            });
        }
    }

    async function showPreview() {
        mainMenu.classList.remove('active');
        hud.style.display = 'none';
        canvas.style.display = 'none';
        previewContainer.style.display = 'flex';

        await initPreviewScene();

        const w = previewContainer.clientWidth;
        const h = previewContainer.clientHeight;
        previewRenderer.setSize(w, h);
        previewCamera.aspect = w / h;
        previewCamera.updateProjectionMatrix();

        startPreviewAnimation();
    }
    
    function hidePreview() {
        stopPreviewAnimation();
        deselectObject();
        previewContainer.style.display = 'none';
        showMainMenu();
    }


    // Event Listeners
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    resumeButton.addEventListener('click', resumeGame);
    restartButton.addEventListener('click', startGame);
    toMenuButton.addEventListener('click', showMainMenu);
    showPreviewButton.addEventListener('click', showPreview);
    backToMenuButton.addEventListener('click', hidePreview);
    toggleCollisionButton.addEventListener('click', toggleCollisionMeshes);
    previewCanvas.addEventListener('click', onPreviewCanvasClick);


    gameContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    gameContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    function init() {
        highScoreDisplay.textContent = highScore.toString();
        renderUIicons();
        showMainMenu();
    }
    init();
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('Service Worker registered:', registration))
            .catch(error => console.log('Service Worker registration failed:', error));
    });
}