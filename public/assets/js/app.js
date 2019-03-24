$.get("/articles", function (data) {
  if (data.length === 0) {
    return;
  } else {
    $("#articles").empty();

    for (var i = 0; i < data.length; i++) {
      $("#articles").append("<p data-id='" + data[i]._id + "'><ul><li><a target='_blank' href='" + data[i].link + "'>" + data[i].title + "</a></p><button class='btn btn-primary' id='savebtn' data-id='" + data[i]._id + "' data-saved='" + data[i].saved +"'> Save Article</button></li></ul>");
    }
  }
});

$(document).on("click", "#savebtn", function () {
  $.ajax({
    url: "/articles/update",
    method: "PUT",
    data: {
      id: $(this).data().id
    }
  }).then(result => {
    console.log(result);
  });
});

$(document).on("click", "#saved", function () {
  $.get("/articles/saved", function (data) {
    $("#articles").empty();

    for (var i = 0; i < data.length; i++) {
      $("#articles").append("<p data-id='" + data[i]._id + "'><ul><li><a href='" + data[i].link + "'>" + data[i].title + "</a></p><button class='btn btn-primary'>Add Comment</button></li></ul>");
    }
  });
});