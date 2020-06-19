import { TimingObject } from 'timing-object';
import { TimingProvider } from 'timing-provider';
import { mediaSync } from './media-sync';

const $pauseButton = document.getElementById('pause');
const $playButton = document.getElementById('play');
const $positionSpan = document.getElementById('position');
const $resetButton = document.getElementById('reset');
const $skipBackwardButton = document.getElementById('skip-backward');
const $skipForwardButton = document.getElementById('skip-forward');
const timingObject = new TimingObject(new TimingProvider('n624E8xbD7rwxklk18ao'));

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

        const updatePosition = () => {
            const { position } = timingObject.query();

            $positionSpan.innerHTML = position.toFixed(2);

            requestAnimationFrame(updatePosition);
        };

        updatePosition();

        mediaSync(document.getElementById('player1'), timingObject);
        mediaSync(document.getElementById('player2'), timingObject);
    }
});
