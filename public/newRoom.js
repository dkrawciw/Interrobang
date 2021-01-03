const newRoomDiv = document.querySelector('#newRoomDiv'),
      newRoomBtn = document.querySelector('#newRoom');
var   showDiv = false;

newRoomBtn.addEventListener('click', function(req, res){
  if(showDiv){
    newRoomDiv.style.display = "none";
    showDiv = false;
  }else{
    newRoomDiv.style.display = "inline";
    showDiv = true;
  }
});
