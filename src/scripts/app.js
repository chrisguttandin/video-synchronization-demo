import { TimingObject } from 'timing-object';
import { TimingProvider } from 'timing-provider';
import { setTimingsrc } from 'timingsrc';

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
        $pauseButton.disabled = false;

        $playButton.addEventListener('click', () => {
            const { position, velocity } = timingObject.query();

            if (position === 100 && velocity === 0) {
                timingObject.update({ position: 0, velocity: 1 });
            } else {
                timingObject.update({ velocity: 1 });
            }
        });
        $playButton.disabled = false;

        $resetButton.addEventListener('click', () => {
            timingObject.update({ position: 0 });
        });
        $resetButton.disabled = false;

        $skipBackwardButton.addEventListener('click', () => {
            const { position } = timingObject.query();

            timingObject.update({ position: position - 5 });
        });
        $skipBackwardButton.disabled = false;

        $skipForwardButton.addEventListener('click', () => {
            const { position } = timingObject.query();

            timingObject.update({ position: position + 5 });
        });
        $skipForwardButton.disabled = false;

        const updateStats = () => {
            const { position } = timingObject.query();

            $currentTime1Span.innerHTML = $player1.currentTime.toFixed(2);
            $currentTime2Span.innerHTML = $player2.currentTime.toFixed(2);
            $positionSpan.innerHTML = position.toFixed(2);

            requestAnimationFrame(updateStats);
        };

        updateStats();

        setTimingsrc($player1, timingObject);
        setTimingsrc($player2, timingObject);
    }
});
