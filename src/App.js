import React, { useState, useEffect } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import MenuIcon from "@material-ui/icons/Menu";
import { auth, db } from "./firebase";
import { Route, Link } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Radio from "@material-ui/core/Radio";
import DissatisfiedIcon from "@material-ui/icons/SentimentDissatisfied";
import SatisfiedIcon from "@material-ui/icons/SentimentSatisfied";
import VeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import VerySatisfiedIcon from "@material-ui/icons/SentimentVerySatisfied";
import { Line } from "react-chartjs-2";
var unirest = require("unirest");
var moment = require("moment");

export function App(props) {
  const [drawer_open, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (u) {
        setUser(u);
      } else {
        props.history.push("/");
      }
    });

    return unsubscribe;
  }, [props.history]);

  if (!user) {
    return <div />;
  }

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        props.history.push("/");
      })
      .catch(error => {
        alert(error.message);
      });
  };

  return (
    <div>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => {
              setDrawerOpen(true);
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            color="inherit"
            style={{ flexGrow: 1, marginLeft: "30px" }}
          >
            Health Tracker
          </Typography>
          <Typography color="inherit" style={{ marginRight: "30px" }}>
            Hi {user.email}!
          </Typography>
          <Button color="inherit" onClick={handleSignOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        open={drawer_open}
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        <List>
          <ListItem
            button
            to="/app"
            component={Link}
            onClick={() => {
              setDrawerOpen(false);
            }}
          >
            <ListItemText primary="Track Your Day" />
          </ListItem>
          <ListItem
            button
            to="/app/chart"
            component={Link}
            onClick={() => {
              setDrawerOpen(false);
            }}
          >
            <ListItemText primary="Historical Data" />
          </ListItem>
        </List>
      </Drawer>
      <Route
        exact
        path="/app"
        render={routeProps => {
          return (
            <Survey
              user={user}
              match={routeProps.match}
              location={routeProps.location}
              history={routeProps.history}
            />
          );
        }}
      />
      <Route
        exact
        path="/app/chart"
        render={routeProps => {
          return (
            <Chart
              user={user}
              match={routeProps.match}
              location={routeProps.location}
              history={routeProps.history}
            />
          );
        }}
      />
    </div>
  );
}
function Survey(props) {
  const [radioValue, setRadioValue] = useState(3);
  const [sleep, setSleep] = useState(8);
  const [temp, setTemp] = useState(100);
  const [lon, setLon] = useState(50);
  const [lat, setLat] = useState(50);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setLat(position.coords.latitude);
      setLon(position.coords.longitude);
    });
  }, []);

  useEffect(() => {
    var req = unirest(
      "GET",
      "https://community-open-weather-map.p.rapidapi.com/weather"
    );

    req.query({
      lat: lat,
      lon: lon,
      units: "imperial"
    });

    req.headers({
      "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
      "x-rapidapi-key": "288c0f6a4bmsh5a3c5e4655c827ap1ea4f9jsn42ff3a761c13"
    });

    req.end(function(result) {
      if (result.error) throw new Error(result.error);
      setTemp(result.body.main.temp);
    });
  }, [lon, lat]);

  const handleSave = () => {
    let today = new Date();
    today = moment(today).format("YYYY-MM-DD HH:mm");
    db.collection("users")
      .doc(props.user.uid)
      .collection("surveys")
      .add({ temp: temp, happiness: radioValue, sleep: sleep, date: today })
      .then(() => {
        props.history.push("/app/chart");
      });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Paper style={{ padding: 30, width: 400, marginTop: 30 }}>
        <Typography>How Many Hours Did You Sleep Last Night?</Typography>
        <TextField
          fullWidth
          value={sleep}
          onChange={s => {
            setSleep(s.target.value);
          }}
        />
        <Typography style={{ marginTop: 20 }}>
          How Do You Feel Today?
        </Typography>
        <div>
          <Radio
            icon={<VeryDissatisfiedIcon />}
            checkedIcon={<VeryDissatisfiedIcon />}
            value={1}
            checked={radioValue === 1}
            onChange={() => {
              setRadioValue(1);
            }}
          />
          <Radio
            icon={<DissatisfiedIcon />}
            checkedIcon={<DissatisfiedIcon />}
            value={2}
            checked={radioValue === 2}
            onChange={() => {
              setRadioValue(2);
            }}
          />
          <Radio
            icon={<SatisfiedIcon />}
            checkedIcon={<SatisfiedIcon />}
            value={3}
            checked={radioValue === 3}
            onChange={() => {
              setRadioValue(3);
            }}
          />
          <Radio
            icon={<VerySatisfiedIcon />}
            checkedIcon={<VerySatisfiedIcon />}
            value={4}
            checked={radioValue === 4}
            onChange={() => {
              setRadioValue(4);
            }}
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: 20 }}
          onClick={handleSave}
        >
          Save
        </Button>
      </Paper>
    </div>
  );
}

function Chart(props) {
  const [temp, setTemp] = useState([]);
  const [happiness, setHappiness] = useState([]);
  const [sleep, setSleep] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection("users")
      .doc(props.user.uid)
      .collection("surveys")
      .onSnapshot(snapshot => {
        const temp_array = [];
        const happiness_array = [];
        const sleep_array = [];

        snapshot.forEach(s => {
          const data = s.data();
          temp_array.push({ x: data.date, y: data.temp });
          happiness_array.push({ x: data.date, y: data.happiness });
          sleep_array.push({ x: data.date, y: data.sleep });
        });
        setTemp(temp_array);
        setHappiness(happiness_array);
        setSleep(sleep_array);
      });
    return unsubscribe;
  }, [props.user]);

  const data = {
    datasets: [
      {
        label: "Temperature",
        data: temp,
        backgroundColor: ["transparent"],
        borderColor: ["red"],
        yAxisID: "A"
      },
      {
        label: "Sleep",
        data: sleep,
        backgroundColor: ["transparent"],
        borderColor: ["blue"],
        yAxisID: "B"
      },
      {
        label: "Happiness",
        data: happiness,
        backgroundColor: ["transparent"],
        borderColor: ["yellow"],
        yAxisID: "B"
      }
    ]
  };

  const options = {
    scales: {
      yAxes: [{ id: "A", position: "left" }, { id: "B", position: "right" }],
      xAxes: [{ type: "time", time: { displayFormats: { hour: "MMM D" } } }]
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Paper style={{ width: 600, marginTop: 30, padding: 30 }}>
        <Typography style={{ margin: 30 }} variant="h6">
          Health Stats Over Time
        </Typography>
        <Line data={data} options={options} style={{ padding: 30 }} />
      </Paper>
    </div>
  );
}
