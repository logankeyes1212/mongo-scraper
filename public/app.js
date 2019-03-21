$(document).ready(function () {
    // scrape()
    function scrape(){
    $.getJSON("/articles", function (data) {
        for (var i = 0; i < data.length; i++) {
            $("#articles").append("<p>" + data[i].title + "</br>" + data[i].link + "</br>" + data[i].summary + "</p>"
                + "<button type='submit' class ='addNote' data-id='" + data[i]._id + "'>Add Note</button><hr>")
        }
    });
    }
    // add notes 
    $(document).on("click", ".addNote", function () {
        // console.log("works")
        $("#notes").empty();

        var thisId = $(this).attr("data-id");
        //   console.log(thisId)
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
            .then(function (data) {
                console.log("data ", data);
                $("#notes").append("<h5>" + data[0].title + "</h5>");
                $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
                $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

                if (data.note) {

                    $("#bodyinput").val(data.note.notes);
                }
            });
        $(document).on("click", "#savenote", function () {

            // console.log($("#bodyinput").val())
            $.ajax({
                method: "POST",
                url: "/articles/" + thisId,
                data: {
                    notes: $("#bodyinput").val()
                }
            })
                .then(function (data) {
                    // console.log(data);
                    $("#notes").empty();
                });
            $("#bodyinput").val("");
        });

    });

    // clears all articles
    $(document).on("click", "#clear", function () {
        event.preventDefault();
        $("#articles").empty()
    })
    $(document).on("click", "#scrape", function(){
       event.preventDefault();
        scrape()
    });
    //   saved articles 
    $(document).on("click", "#saved", function () {
       event.preventDefault();
        $("#articles").empty()
        $.getJSON("/notes", function (data) {
            console.log(data)
            for (var i = 0; i < data.length; i++) {
                $("#articles").append("<p>" + data[i].notes + "</br>" + data[i].link + "</br>" + data[i].summary + "</p><hr>")
            }
        });
    });
});