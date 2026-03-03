function toggleCareer(card){
  card.classList.toggle("open");
}

function openContact(){
  const section=document.getElementById("contact");
  if(section){
    section.classList.add("open");
    section.scrollIntoView({behavior:"smooth"});
  }
}

function showSuccess(){
  const msg=document.getElementById("success-msg");
  const btn=document.getElementById("submit-btn");
  if(msg) msg.style.display="block";
  if(btn){ btn.disabled=true; btn.innerText="전송 완료 ✓"; }
}

function openImage(src){
  const viewer=document.getElementById("imageViewer");
  const img=document.getElementById("viewerImg");
  img.src=src;
  viewer.style.display="flex";
}

function closeImage(){
  document.getElementById("imageViewer").style.display="none";
}
