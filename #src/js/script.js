document.addEventListener("DOMContentLoaded", function(){ // аля $(document).ready
  let videos = document.getElementsByClassName('video'); // получаем все видосы с класосм
  videos = [].slice.call(videos); // преобразуем в массив
  videos.forEach(function(item) { // перебираем массив и навешиваем обработчики
    let media = item;
    media.onclick = function () {
      media.play(); // запускаем проигрывание
      media.controls = true; // добавляем контролы
    };
    // media.addEventListener('ended', function() {
    //   media.controls = false; // видео просмотрено, убираем контролы
    // });
  });
});