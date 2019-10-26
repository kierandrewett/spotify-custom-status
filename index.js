const { get, patch } = require("axios");
const open = require("open");
const chalk = require("chalk");
const fs = require("fs");

open(
  "https://accounts.spotify.com/en/authorize?response_type=token&redirect_uri=http:%2F%2Flocalhost:3000%2Fauthorize&client_id=02f6ad5796084bb59c0cfde471a68a66&scope=user-read-currently-playing"
);

Date.prototype.addHours = function(h) {
  this.setHours(this.getHours() + h);
  return this;
};

fs.closeSync(fs.openSync(process.cwd() + "\\config.json", "a"));

setInterval(() => {
  if (process.env.TOKEN) {
    client();
    setInterval(() => client, 8000);
  }
}, 10000);

function client() {
  (async () => {
    get("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${process.env.TOKEN}` }
    }).then(res => {
      const track = {
        emoji: "🎵"
      };

      if (res.data) {
        if (res.data.item) {
          res.data.item.artists.forEach(atst => {
            track.artists = `${!track.artists ? `` : `${track.artists}, `}${
              atst.name
            }`;
          });
        } else {
          track.name = `Advertisment`;
          track.artists = "Spotify";
          track.emoji = "ℹ";
        }

        track.name = res.data.item.name;

        track.overview = `${track.name} by ${track.artists}`;

        if (res.data.is_playing == true) {
          track.emoji = "🎵";
        } else {
          track.emoji = "⏸";
        }

        patch(
          "https://canary.discordapp.com/api/v6/users/@me/settings",
          {
            custom_status: {
              text: `${track.overview}`,
              expires_at: new Date().addHours(4).toISOString(),
              emoji_name: track.emoji
            }
          },
          {
            headers: {
              Authorization: require("./config").token,
              "Content-Type": "application/json"
            }
          }
        )
          .then(() => {
            console.log(
              `${chalk.gray(">")} Dispatched status event for ${
                track.name
              }, and it expires in 4 hours. Next dispatch in 8 seconds...`
            );
          })
          .catch(err => {
            console.log(
              `${chalk.red(
                "> Failed to dispatch custom status. Is your token set or up to date?"
              )}`
            );
          });
      } else {
        patch(
          "https://canary.discordapp.com/api/v6/users/@me/settings",
          {
            custom_status: {
              text: "",
              expires_at: new Date().addHours(-1).toISOString(),
              emoji_name: ""
            }
          },
          {
            headers: {
              Authorization: require("./config").token,
              "Content-Type": "application/json"
            }
          }
        ).catch(err => {
          console.log(
            `${chalk.red(
              "> Failed to reset custom status. Is your token set or up to date?"
            )}`
          );
        });

        console.log(
          `${chalk.yellow(
            "> Hmm. Spotify isn't open on your computer or nothing is playing."
          )}`
        );
      }
    });
  })();
}
