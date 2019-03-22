$(document).ready(function () {
    // scrape()
    function scrape(){
    $.getJSON("/articles", function (data) {
        for (var i = 0; i < data.length; i++) {
            $("#articles").append("<p>" + data[i].title + "</br></br><a href='https://www.nytimes.com/section/politics"+ data[i].link + "'>Link</a></br></br>" + data[i].summary + "</p>"
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
                $("#notes").append("<button data-id='" + data._id + "' class='savenote'>Save Note</button>");

                if (data.note) {

                    $("#bodyinput").val(data.note.notes);
                }
            });
        $(document).on("click", ".savenote", function () {

            // console.log($("#bodyinput").val())
            $.ajax({
                method: "POST",
                url: "/articles/" + thisId,
                data: {
                    notes: $("#bodyinput").val(),
                    artId: thisId,
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
    //scrape for new articles
    $(document).on("click", "#scrape", function(){
       event.preventDefault();
        scrape()
    });
    //   saved articles 
    $(document).on("click", "#saved", function () {
       event.preventDefault();
        $("#articles").empty()
        $.getJSON("/notes", function (data) {
        // $.getJSON("/articles", function(data1))    
            console.log(data)
            for (var i = 0; i < data.length; i++) {
                const dataNotes = data[i].notes
                // $("#articles").append("<p>" + data[i].notes + "</br>" + data[i].title + "</br>" + data[i].summary + "</p><hr>")
                $.ajax({
                    method: "GET",
                    url: "/articles/" + data[i].artId,
                    // data: {
                    //     notes: $("#bodyinput").val()
                    // }
                })
                    .then(function (data2) {
                        console.log(data2);
                        $("#articles").append("<p>Your notes<br>" + dataNotes + "</br></br>" + data2[0].title + "</br></br>" + data2[0].summary + "</p><hr>")

                        // $("#notes").empty();
                    });
            }
        });
    });
});