var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    methodOverride = require("method-override"),
    mysql          = require("mysql"),
    cookieParser   = require("cookie-parser"),
    session        = require("express-session"),
    bcrypt         = require('bcrypt');
    
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'REMS'
});

function Report(id, userName, email, contact) {
    this.userName = userName;
    this.userID = id;
    this.email = email;
    this.contactNum = contact;
    this.houseSold = 0;
    this.houseSoldPrice = 0;
    this.houseRented = 0;
    this.houseRentedFor = 0;
    this.apartmentSold = 0;
    this.apartmentSoldPrice = 0;
    this.apartmentRented = 0;
    this.apartmentRentedFor = 0;
}

function resultToReport(result) {
    var j = -1;
    var agentReport = [];
    var prevAgent = "";
    for (var i = 0; i < result.length; i++) {
        if (result[i].name == prevAgent) {
            if(result[i].propType == 'H') {
                if(result[i].listType == 'S') {
                    agentReport[j].houseSold = result[i].count;
                    agentReport[j].houseSoldPrice = result[i].price;
                } else {
                    agentReport[j].houseRented = result[i].count;
                    agentReport[j].houseRentedFor = result[i].price;
                }
            } else {
                if(result[i].listType == 'S') {
                    agentReport[j].apartmentSold = result[i].count;
                    agentReport[j].apartmentSoldPrice = result[i].price;
                } else {
                    agentReport[j].apartmentRented = result[i].count;
                    agentReport[j].apartmentRentedFor = result[i].price;
                }
            }
        } else {
            j += 1;
            agentReport.push(new Report(result[i].EID, result[i].name, result[i].email, result[i].contactNum));
            prevAgent = result[i].name;
            i -= 1;
        }
    }
    return agentReport;
}
// ===================================================================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
// app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(cookieParser());

app.use(session({
    secret: 'thisProjectIsBoring',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30*60*1000}
}));

// app.use(passport.initialize());
// app.use(passport.session());

// =================== ROUTES ================================

app.get("/", function(req, res) {
    res.redirect("/login");
});

app.get("/login", function(req, res) {
    res.render("index", {invalid: false});
})

// app.post("/login", passport.authenticate('local-login', {
//     successRedirect: '/agent/5',
//     failureRedirect: '/login',
//     failureFlash: true
// }), function(req, res) {
//     console.log("logged");
//     if(req.body.remember) {
//         req.session.cookie.maxAge = 1000 * 60 * 3;
//     } else {
//         req.session.cookie.expires = false;
//     }
//     res.redirect("/agent/5");
// });

app.post("/login", function(req, res) {
    var id = req.body.userid;
    var password = req.body.password;
    if (req.body.agent) {
        connection.query("SELECT EID, password, officeID FROM employee WHERE EID = ? AND EID NOT IN (SELECT EID FROM manager)", [id], function(err, results) {
            if(results.length) {
                bcrypt.compare(password, results[0].password, function(err, result) {
                    if (result) {
                        req.session.userID = results[0].EID;
                        req.session.officeID = results[0].officeID;
                        var redir = `/agent/${id}`;
                        res.redirect(redir);
                    } else {
                        res.render("index", {invalid: true});        
                    }
                });
            } else {
                res.render("index", {invalid: true});        
            }
        });
    } else if (req.body.manager) {
        connection.query("SELECT EID, password, officeID FROM manager WHERE manager.EID = ?", [id], function(err, results) {
            if(results.length) {
                bcrypt.compare(password, results[0].password, function(err, result) {
                    if (result) {
                        req.session.userID = results[0].EID;
                        req.session.officeID = results[0].officeID;
                        var redir = `/manager/${id}`;
                        res.redirect(redir);
                    } else {                        
                        res.render("index", {invalid: true});        
                    }
                });
            } else {
                res.render("index", {invalid: true});        
            }
        });
    } else {
        res.render("index", {invalid: true});        
    }
})

app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            res.redirect("/agent/"+req.session.userId);
        } else {
            res.redirect("/");
        }
    })
});

app.get("/agent/:id", function(req, res) {
    var id = req.params.id;
    if (id == req.session.userID) {
        connection.query('SELECT * FROM employee WHERE employee.EID = ?', id, function(err, result) {
            if(err) {
                console.log(err);
            } else {
                var user = result[0];
                connection.query('SELECT listType, propType, COUNT(*) as count FROM property WHERE officeID = ? AND EID IS NULL GROUP BY listType, propType', user.officeID, function(error, result) {
                    if(error) {
                        console.log(error);
                    } else {
                        var officeStats = result;
                        var date = new Date();
                        var firstDay = new Date(date.getFullYear(), 0, 1);
                        var lastDay = new Date(date.getFullYear(), 11, 31);
                        connection.query('SELECT propType, listType, COUNT(*) as count, SUM(price) as sum FROM property WHERE (property.EID) = ? AND dateSold BETWEEN ? AND ? GROUP BY propType, listType;', [id, firstDay, lastDay], function(err, result) {
                            if(err) {
                                console.log(err);
                            } else {
                                var empStats = result;
                                res.render("./agent/dashboard", {user: user, office: officeStats, emp: empStats});                        }
                        })
                    }
                });
            }
        });
    } else {
        res.redirect("/logout");
    }
});

app.get("/manager/:id", function(req, res) {
    var id = req.params.id;
    var officeID = req.session.officeID;
    var userID = req.session.userID;
    if (id == userID) {
        connection.query('SELECT EID, name, email, contactNum, officeID, street, city, state, zipcode, buildingNumber FROM manager WHERE manager.officeID = ?', officeID, function(err, result) {
            if(err) {
                console.log(err);
            } else {
                var user = result[0];
                connection.query('SELECT listType, propType, COUNT(*) as count FROM property WHERE officeID = ? AND EID IS NULL GROUP BY listType, propType', user.officeID, function(error, result) {
                    if(error) {
                        console.log(error);
                    } else {
                        var officeStats = result;
                        var date = new Date();
                        var firstDay = new Date(date.getFullYear(), 1, 1);
                        var lastDay = new Date(date.getFullYear(), 12, 31);
                        connection.query('SELECT propType, listType, COUNT(*) as count, SUM(price) as sum FROM property WHERE (property.officeID) = ? AND EID IS NOT NULL AND dateSold BETWEEN ? AND ? GROUP BY propType, listType;', [user.officeID, firstDay, lastDay], function(err, result) {
                            if(err) {
                                console.log(err);
                            } else {
                                var officeSales = result;
                                res.render("./manager/dashboard", {user: user, office: officeStats, officeSales: officeSales});                        }
                        })
                    }
                });
            }
        })
    } else {
        res.redirect("/logout")
    }
});

app.post("/manager/:id/report", function(req, res) {
    var id = req.params.id;
    var officeID = req.session.officeID;
    var userID = req.session.userID;
    if (id == userID) {
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), 0, 1);
        var lastDay = new Date(date.getFullYear(), 11, 31);
        var qu = connection.query('SELECT EID, name, email, officeID, contactNum, COUNT(PID) AS count, SUM(price) AS price, listType, propType FROM employee NATURAL JOIN property WHERE officeID = ? AND DATESOLD BETWEEN ? AND ? GROUP BY 1, 2, 3, 4, 5, 8, 9', [officeID, firstDay, lastDay], function(err, results) {
            report = resultToReport(results);
            res.render("./manager/report", {name: req.body.name, userID: userID, reports: report});
        });
    } else {
        res.redirect("/logout");
    }
});

app.post("/manager/:id/report/:agid", function(req, res) {
    var managerID = req.params.id;
    var officeID = req.session.officeID;
    var userID = req.session.userID;
    var agentID = req.params.agid;
    if (managerID == userID) {
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), 0, 1);
        var lastDay = new Date(date.getFullYear(), 11, 31);
        var qu = connection.query("SELECT * FROM property WHERE (officeID, EID) = (?, ?) AND DATESOLD BETWEEN ? AND ?", [officeID, agentID, firstDay, lastDay], function(err, result) {
            console.log(result);
            res.render("properties", {name: req.body.name, userID: managerID, property: result, agent:false, propertyUpdate: false});
        });
    } else {
        res.redirect("/logout");
    }
});

app.post("/agent/:id/properties", function(req, res) {
    var userID = req.session.userID;
    var officeID = req.session.officeID;
    if (req.body.officeID == officeID && userID == req.params.id) {
        var qu = connection.query('SELECT * FROM property WHERE officeID = ? AND EID IS NULL', officeID, function(err, results) {
            res.render("properties", {name: req.body.userName, userID: userID, property: results, agent: true, propertyUpdate: false});
        });
    } else {    
        res.redirect("/logout");
    }
});

app.post("/filter", function(req,res){
    res.send("Hello");
});

app.put("/agent/:id/properties", function(req, res) {
    var userID = req.session.userID;
    var officeID = req.session.officeID;
    var PID = req.body.PID;
    var today = new Date();
    if (req.body.EID == userID) {
        connection.query('UPDATE property SET EID = ?, dateSold = ? WHERE (officeID, PID) = (?, ?) AND dateSold IS NULL', [userID, today, officeID, PID], function(err, result) {
            var success;
            console.log(result);
            if (result.changedRows == 0) {
                success = false;
            } else {
                success = true;
            }
            connection.query('SELECT * FROM property WHERE officeID = ? AND EID IS NULL', officeID, function(err, results) {
                res.render("properties", {name: req.body.name, userID: userID, property: results, agent: true, propertyUpdate: true, propertyUpdateSuccessful: success});
            });
        });
    } else {
        res.redirect("/logout");
    }
});

app.get("*", function(req, res) {
    res.render("error.ejs");
})



app.listen(9090, function() {
    console.log("The Real Estate Management System Server is now active!");
    console.log("Visit the website at\tlocalhost:9090/");
})


// CREATE VIEW manager AS SELECT EID, name, email, contactNum, password, employee.officeID as officeID, street, city, state, zipcode, buildingNumber FROM employee JOIN salesOffice ON employee.EID = salesOffice.managerID;
// EID, name, email, contactNum, officeID, street, city, state, zipcode, buildingNumber

// UPDATE property SET EID = 9, dateSold = "2020-04-23" WHERE (officeID, PID) = (1, 2945) AND dateSold IS NULL;