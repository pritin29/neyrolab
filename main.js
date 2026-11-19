let crystals = 0;
const score = document.querySelector("#score");
const mine = document.querySelector("#mine");
function collect() {
crystals += 1;
score.textContent = crystals;
}


mine.addEventListener("click", collect);