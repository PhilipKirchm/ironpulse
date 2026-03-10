
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const today = new Date().getDay(); // 0-6
const adjIndex = (today + 6) % 7;

console.log('Today is:', days[today]);
console.log('JS Day Index:', today);
console.log('Plan Index (Mon=0):', adjIndex);

const planDays = [
    'Push Hyper', 'Pull Hyper', 'Legs Hyper (Hammies)', 'Rest', 'Upper Power', 'Lower Power (Quads)', 'Rest'
];

console.log('Expected Workout:', planDays[adjIndex]);
