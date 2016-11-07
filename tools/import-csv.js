var converter = new (require("csvtojson").Converter) ({
    noheader: true,
    headers: ["series_title", "season", "episode", "title"]

});

converter.on("end_parsed", function (data) {
    console.log(data);
});


require("fs").createReadStream("Book1.csv").pipe(converter);