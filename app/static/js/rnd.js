document.addEventListener("DOMContentLoaded", function() {
  let a = getCookie("animPlayed");
  if (a != "") {
    document.getElementById("wrapper").classList.add('notransition'); // Disable transitions
    openNav()
    document.getElementById("wrapper").offsetHeight; // Trigger a reflow, flushing the CSS changes
    document.getElementById("wrapper").classList.remove('notransition');
  } else {
    openNav()
    document.cookie = "animPlayed=true;";
  }

});

function openNav() {
  m = document.getElementsByClassName("outer")[0];
  document.getElementById("bestSidenav").style.width = "20%";
  document.getElementById("wrapper").style.marginLeft = "20%";
  m.style.width = "79%";
}
function closeNav() {
  m = document.getElementsByClassName("outer")[0];
  document.getElementById("bestSidenav").style.width = "0";
  document.getElementById("wrapper").style.marginLeft = "0";
  m.style.width = "99%";
}
function makeDate()
{
  let today = new Date();
  let date = today.getDate()+"."+(today.getMonth()+1)+"."+today.getFullYear();
  let time = today.getHours() + ":" + today.getMinutes();
  document.getElementById("date").innerHTML = date;
  document.getElementById("time").innerHTML = time;

}

setInterval(makeDate, 100);

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}