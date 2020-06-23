import { TimingObject } from 'timing-object';
import { TimingProvider } from 'timing-provider';
import { mediaSync } from './media-sync';

const $currentTime1Span = document.getElementById('current-time-1');
const $currentTime2Span = document.getElementById('current-time-2');
const $pauseButton = document.getElementById('pause');
const $playButton = document.getElementById('play');
const $player1 = document.getElementById('player-1');
const $player2 = document.getElementById('player-2');
const $positionSpan = document.getElementById('position');
const $resetButton = document.getElementById('reset');
const $skipBackwardButton = document.getElementById('skip-backward');
const $skipForwardButton = document.getElementById('skip-forward');
const timingObject = new TimingObject(new TimingProvider('0123456789abcdefghij'));

timingObject.addEventListener('readystatechange', () => {
    if (timingObject.readyState === 'open') {
        $pauseButton.addEventListener('click', () => {
            timingObject.update({ velocity: 0 });
        });

        $playButton.addEventListener('click', () => {
            const { position, velocity } = timingObject.query();

            if (position === 100 && velocity === 0) {
                timingObject.update({ position: 0, velocity: 1 });
            } else {
                timingObject.update({ velocity: 1 });
            }
        });

        $resetButton.addEventListener('click', () => {
            timingObject.update({ position: 0 });
        });

        $skipBackwardButton.addEventListener('click', () => {
            const { position } = timingObject.query();

            timingObject.update({ position: position - 5 });
        });

        $skipForwardButton.addEventListener('click', () => {
            const { position } = timingObject.query();

            timingObject.update({ position: position + 5 });
        });

        const updateStats = () => {
            const { position } = timingObject.query();

            $currentTime1Span.innerHTML = $player1.currentTime.toFixed(2);
            $currentTime2Span.innerHTML = $player2.currentTime.toFixed(2);
            $positionSpan.innerHTML = position.toFixed(2);

            requestAnimationFrame(updateStats);
        };

        updateStats();

        mediaSync($player1, timingObject);
        mediaSync($player2, timingObject);
    }
});
