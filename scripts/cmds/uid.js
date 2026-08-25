//* credit change korle tmr e soho tmr pora gustti ti re chude dimu  
//*  300 speed a bujla so not change credit 
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "uid",
    version: "1.1",
    author: "Sk Habibulla",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get user's UID and elegant profile banner"
    },
    longDescription: {
      en: "Generates a modern, elegant gradient-style banner with User ID and Avatar."
    },
    category: "info",
    guide: {
      en: "{pn} [mention | reply | leave blank]"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `uid_card_${Date.now()}.png`);
    fs.ensureDirSync(cacheDir);

    // 1. Target user
    let targetID = senderID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0 && !isNaN(args[0])) {
      targetID = args[0];
    }

    const processMsg = await api.sendMessage("🎨 Generating your card...", threadID);

    try {
      // 2. User data
      const userData = await usersData.get(targetID);
      const name = userData.name || "Unknown User";

      // 3. Canvas
      const width = 1200;
      const height = 500;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, "#0f0c29");
      bgGradient.addColorStop(0.45, "#302b63");
      bgGradient.addColorStop(1, "#24243e");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle dots
      ctx.save();
      ctx.globalAlpha = 0.05;
      for (let x = 0; x < width; x += 26) {
        for (let y = 0; y < height; y += 26) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(x, y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Glow circles
      function drawGlowCircle(x, y, r, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      drawGlowCircle(1020, 60, 280, "#f472b6", 0.30);
      drawGlowCircle(100, 470, 240, "#38bdf8", 0.28);
      drawGlowCircle(980, 440, 200, "#34d399", 0.18);
      drawGlowCircle(600, 20, 260, "#a78bfa", 0.16);

      // Glass card
      function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }
      ctx.save();
      roundRect(50, 50, width - 100, height - 100, 42);
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      ctx.fill();
      const borderGrad = ctx.createLinearGradient(50, 50, width - 50, height - 50);
      borderGrad.addColorStop(0, "rgba(244,114,182,0.55)");
      borderGrad.addColorStop(0.5, "rgba(167,139,250,0.45)");
      borderGrad.addColorStop(1, "rgba(96,165,250,0.55)");
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = borderGrad;
      ctx.stroke();
      ctx.restore();

      // Inner hairline
      ctx.save();
      roundRect(66, 66, width - 132, height - 132, 34);
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Corner accent
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width - 110, 90);
      ctx.lineTo(width - 90, 90);
      ctx.moveTo(width - 90, 90);
      ctx.lineTo(width - 90, 110);
      ctx.stroke();
      ctx.restore();

      // Avatar
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      let avatarBuffer;
      try {
        const response = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 15000 });
        avatarBuffer = response.data;
      } catch (e) {
        const fallbackUrl = `https://graph.facebook.com/${targetID}/picture?type=large`;
        const response = await axios.get(fallbackUrl, { responseType: "arraybuffer", timeout: 15000 });
        avatarBuffer = response.data;
      }
      const avatarImg = await loadImage(avatarBuffer);

      const centerX = 260;
      const centerY = 250;
      const radius = 150;

      drawGlowCircle(centerX, centerY, radius + 60, "#a78bfa", 0.22);

      // Dashed ring
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;
      ctx.arc(centerX, centerY, radius + 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Gradient glow ring
      const ringGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      ringGradient.addColorStop(0, "#f472b6");
      ringGradient.addColorStop(0.5, "#a78bfa");
      ringGradient.addColorStop(1, "#60a5fa");

      ctx.save();
      ctx.shadowColor = "#a78bfa";
      ctx.shadowBlur = 45;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.restore();

      // White separator ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Circular clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, centerX - radius, centerY - radius, radius * 2, radius * 2);

      const avatarShade = ctx.createRadialGradient(centerX, centerY, radius * 0.6, centerX, centerY, radius);
      avatarShade.addColorStop(0, "rgba(0,0,0,0)");
      avatarShade.addColorStop(1, "rgba(0,0,0,0.18)");
      ctx.fillStyle = avatarShade;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();

      // ═══════ TEXT ═══════

      // Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 58px Arial";
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 14;
      ctx.fillText(name, 480, 165);
      ctx.shadowBlur = 0;

      // UID
      roundRect(480, 210, 46, 46, 12);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial";
      ctx.fillText("🆔", 491, 241);

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "18px Arial";
      ctx.fillText("USER ID", 542, 225);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px Courier New";
      ctx.fillText(targetID, 542, 252);

      // Date
      ctx.fillStyle = "rgba(255,255,255,0.70)";
      ctx.font = "bold 26px Arial";
      ctx.fillText(`📅 ${new Date().toLocaleDateString("en-GB")}`, 480, 320);

      // ═══════ Single Gradient Line ═══════
      const lineGradient = ctx.createLinearGradient(480, 0, 1080, 0);
      lineGradient.addColorStop(0, "#f472b6");
      lineGradient.addColorStop(0.5, "#a78bfa");
      lineGradient.addColorStop(1, "#60a5fa");
      ctx.fillStyle = lineGradient;
      ctx.fillRect(480, 355, 600, 3);

      // ═══════ Powered by ═══════
      ctx.save();
      const brandGradient = ctx.createLinearGradient(480, 0, 900, 0);
      brandGradient.addColorStop(0, "#f472b6");
      brandGradient.addColorStop(0.5, "#a78bfa");
      brandGradient.addColorStop(1, "#60a5fa");
      ctx.fillStyle = brandGradient;
      ctx.font = "bold 34px Arial";
      ctx.shadowColor = "rgba(167,139,250,0.6)";
      ctx.shadowBlur = 16;
      ctx.fillText("⚡ Powered by Sk Habib ", 480, 415);
      ctx.restore();

      // Save & Send
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);

      try { await api.unsendMessage(processMsg.messageID); } catch (e) {}

      return api.sendMessage(
        {
          body: ` ${targetID}`,
          attachment: fs.createReadStream(cachePath)
        },
        threadID,
        () => { try { fs.unlinkSync(cachePath); } catch (e) {} },
        messageID
      );

    } catch (error) {
      console.error("[uid]", error);
      try { await api.unsendMessage(processMsg.messageID); } catch (e) {}
      return api.sendMessage("❌ Error generating image. Details: " + error.message, threadID, messageID);
    }
  }
};
