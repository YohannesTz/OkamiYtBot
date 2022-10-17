import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";
import axios from "axios";
import { Bot, Context, InlineKeyboard } from "grammy";
require('dotenv').config()

type MyContext = HydrateFlavor<Context>;

const botToken = process.env.BOT_TOKEN || '';
const apiKey = process.env.WEATHER_TOKEN || '';
const baseUrl = "https://api.openweathermap.org/data/2.5/weather"
const BOT_DEVELOPER = 5395438361; // bot developer chat identifier
const bot = new Bot<MyContext>(botToken);


const emojies = {
    "thunderstorm" : "\u{1F4A8}",
    "drizzle" : "\u{1F4A7}",
    "rain" : "\u{02614}",
    "snowflake" : "\u{02744}",
    "snowman" : "\u{026C4}",
    "atmosphere" : "\u{1F301}",
    "clearSky" : "\u{02600}",
    "fewClouds" : "\u{026C5}",
    "clouds" : "\u{02601}",
    "hot" : "\u{1F525}",
    "default" : "\u{1F300}"
};

//const commandsMessage = 'Available Commands:\n/weather_addis\n/weather_gondar\n/weather_mekelle\n/weather_adama\n/weather_awassa\n/weather_bahirdar\n/weather_diredawa\n/weather_jimma\n/weather_jijiga\n/weather_sodo\n/weather_gambella\n/weather_jinka \n \n \nmade with ❤️ by @yohan_nes';

const inlineKeyboard = new InlineKeyboard()
  .text("Addis Ababa", "Addis Ababa")
  .text("Gondar", "Gondar")
  .text("Mekelle", "Mekelle").row()
  .text("Adama", "Adama")
  .text("Bahirdar", "Bahir dar")
  .text("Dire", "Dire dawa").row()
  .text("Jimma", "Jimma")
  .text("Jijiga", "Jijiga")
  .text("Sodo", "Sodo").row()
  .text("Gambella", "Gambella")
  .text("Jinka", "Jinka").row()
  .text("MarkDown and reply Test", "mkTest")
  .text("Am I the Dev?", "isDev")

/*   bot.use(async (ctx, next) => {
    // Modify context object here by setting the config.
    ctx.config = {
      botDeveloper: BOT_DEVELOPER,
      isDeveloper: ctx.from?.id === BOT_DEVELOPER,
    };
    // Run remaining handlers.
    await next();
  });
 */
bot.use(hydrate())
bot.command("start", (ctx) => ctx.reply(`Hi ${ctx.message?.from.first_name},\nThis is simple bot to tell the weather of main Ethiopian cities at the requested time.`, { reply_markup: inlineKeyboard }));

bot.on("callback_query", async(ctx) => {
    //console.log(ctx.)
    let cityName = ctx.update.callback_query.data;
    console.log(`requested for ${cityName}`)
    if (cityName == "mkTest") {
        await ctx.reply("*Hi\\!* _Welcome_ to [grammY](https://grammy.dev)\\.", {
            reply_to_message_id: ctx.msg?.message_id,
            parse_mode: "MarkdownV2" 
        })

        await ctx.answerCallbackQuery({
            //text: `Weather Data for ${cityName}!`,
        });
        await ctx.deleteMessage()
        return 
    }
    try {
        const response = await axios.get(baseUrl + `?q=${cityName}&appid=${apiKey}&units=metric`)
        let emojiKey:string = response.data.weather[0].main.toLowerCase();
        let emoji:string = emojies[emojiKey as keyof typeof emojies];
        let message = `${response.data.name} ${emoji}\n${capitalizeFirstLetter(response.data.weather[0]?.description)}\n`
                       + `Temprature: ${response.data.main.temp_min} °C\n`
                       + `Maximum: ${response.data.main.temp_max} °C\n`
                       + `Humidity: ${response.data.main.humidity}\n`
                       + `Wind: Speed ${response.data.wind.speed}, Degree ${response.data.wind.deg}`;
        ctx.reply(message);
        await ctx.answerCallbackQuery({
            text: `Weather Data for ${cityName}!`,
        });
    } catch(error) {
        console.log(error);
        await ctx.answerCallbackQuery({
            text: `Weather Data for ${cityName}`,
        });
    }
});

function capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

bot.start();