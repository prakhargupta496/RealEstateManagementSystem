
document.body.onload = function() {
	console.log("Tjallabais");
	document.getElementById("templateContainer").innerHTML = templates["templates/1.tmpl"]({name: "world"})
}