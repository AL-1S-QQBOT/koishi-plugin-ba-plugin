import { Context, h, Logger, Random, Time } from 'koishi';
import { } from 'koishi-plugin-puppeteer'
import { FMPS } from '../FMPS/FMPS';
import { rootF } from '../FMPS/FMPS_F';
import { Config } from '..';
import { Image } from '@koishijs/canvas';
import { pathToFileURL } from 'url'
import { resolve } from 'path'
import { } from "@satorijs/adapter-qq";
//import zhCNi8n from '../locales/zh-CN.yml'

const log = "ba-plugin-get-active"
const logger: Logger = new Logger(log)
const random = new Random(() => Math.random())

//export const using = ['puppeteer'] as const;
export const inject = ['puppeteer']
//Alin's ba zongli&dajuezhan get v1.0-rc 2024-05-24
export async function active_get(ctx: Context, config: Config) {
    const root_act = await rootF('bap-active')
    const root_img = await rootF("bap-img")
    const fmp = new FMPS(ctx)

    const mdid = config.qqconfig.markdown_setting.table.length == 1 ?
        config.qqconfig.markdown_setting.table[0]['MD模板id'] :
        config.qqconfig.markdown_setting.table.length == 0 ?
            null : config.qqconfig.markdown_setting.table[1]['MD模板id']
    const mdkey1 = config.qqconfig.markdown_setting.table.length == 1 ?
        config.qqconfig.markdown_setting.table[0]['MD模板参数1'] :
        config.qqconfig.markdown_setting.table.length == 0 ?
            null : config.qqconfig.markdown_setting.table[1]['MD模板参数1']
    const mdkey2 = config.qqconfig.markdown_setting.table.length == 1 ?
        config.qqconfig.markdown_setting.table[0]['MD模板参数2'] :
        config.qqconfig.markdown_setting.table.length == 0 ?
            null : config.qqconfig.markdown_setting.table[1]['MD模板参数2']
    const drawm = config.plugin_config.draw_modle == "canvas" ? "" : 'file://'

    var mdswitch: boolean = false
    if (mdid && mdkey1 && mdid) {
        logger.info('🟢 总力获取功能已启用MD消息模板')
        mdswitch = true
    } else {
        logger.info("⚠️ md相关设置未完善,未启用MD模板")
        mdswitch = false
    }

    function markdown(session) {
        let t2
        mdkey2 ? t2 = {
            key: mdkey2,
            values: ["点击按钮直接查询哦"],
        } : ''
        return {
            msg_type: 2,
            msg_id: session.messageId,
            markdown: {
                custom_template_id: mdid,
                params: [
                    {
                        key: mdkey1,
                        values: ["总力战和大决战档线查询，支持日服、国服官服、国服B服"],
                    },
                    t2
                ]
            },
            keyboard: {
                content: {
                    rows: [
                        {
                            buttons: [
                                {
                                    render_data: { label: "国服官服", style: 2 },
                                    action: {
                                        type: 2, // 指令按钮
                                        permission: { type: 2 },
                                        data: `/总力档线 官服`,
                                        enter: true,
                                    },
                                },
                                {
                                    render_data: { label: "国服B服", style: 2 },
                                    action: {
                                        type: 2,
                                        permission: { type: 2 },
                                        data: `/总力档线 B服`,
                                        enter: true,
                                    },
                                },
                            ]
                        },
                        {
                            buttons: [
                                {
                                    render_data: { label: "日服总力", style: 2 },
                                    action: {
                                        type: 2,
                                        permission: { type: 2 },
                                        data: `/总力档线 日服`,
                                        enter: true,
                                    },
                                },
                                {
                                    render_data: { label: "日服大决战", style: 2 },
                                    action: {
                                        type: 2,
                                        permission: { type: 2 },
                                        data: `/大决战档线`,
                                        enter: true,
                                    },
                                },
                            ]
                        },
                    ],
                },
            },
        }
    }

    async function 大决战获取() {
        for (let i = 1; i <= 5; i++) {
            try {
                const page = await ctx.puppeteer.page();
                await page.goto('https://arona.ai/egraph');
                await page.waitForSelector(".MuiBox-root.css-tucewo")
                await page.waitForSelector(".MuiBox-root.css-1tu59u4")
                await page.waitForSelector(".MuiBox-root.css-14syrz5")
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                await delay(5000);
                const web_time = await page.$(".MuiBox-root.css-1tu59u4");
                const grade_line = await page.$(".MuiBox-root.css-tucewo")
                const imageUrls = await page.evaluate(() => {
                    const images = Array.from(document.querySelectorAll('.MuiBox-root.css-14syrz5 img'));
                    return images.map(img => img.getAttribute('src'));
                });
                const w_time = (await page.evaluate((el: Element) => (el as HTMLElement).innerText, web_time)).split(' ');
                const g_line = (await page.evaluate((el: Element) => (el as HTMLElement).innerText, grade_line)).split('\n');
                if (g_line && !g_line.includes('— 0 /Hr')) {
                    return {
                        time: w_time[2] + w_time[3] + w_time[4] + w_time[6],
                        urls: imageUrls,
                        hard_1: [g_line[1], g_line[2]],
                        hard_2: [g_line[4], g_line[5]],
                        hard_3: [g_line[7], g_line[8]],
                    }
                }
                await page.close();
            } catch (e) {
                if (i == 5) {
                    logger.error("尝试" + i + "次后依旧出错" + e)
                    break
                }
                logger.error("出现错误,第" + i + "次重试" + e)
            }
        }
    }
    async function zongli_get_jp() {
        for (let i = 1; i <= 5; i++) {
            try {
                const page = await ctx.puppeteer.page();
                await page.goto('https://arona.ai/graph');
                await page.waitForSelector(".MuiBox-root.css-tucewo")
                await page.waitForSelector('.MuiBox-root.css-1f11ikm');
                await page.waitForSelector(".MuiBox-root.css-1tu59u4")
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                await delay(5000);
                const grade_line = await page.$(".MuiBox-root.css-tucewo")
                const grade_people = await page.$('.MuiBox-root.css-1f11ikm');
                const web_time = await page.$(".MuiBox-root.css-1tu59u4");
                const pei_time = await page.$(".MuiBox-root.css-1m93l24")
                // 获取元素内容
                const g_line = (await page.evaluate((el: Element) => (el as HTMLElement).innerText, grade_line)).split('\n');
                const g_people = (await page.evaluate((el: Element) => (el as HTMLElement).innerText, grade_people)).split('\n');
                const w_time = (await page.evaluate((el: Element) => (el as HTMLElement).innerText, web_time)).split(' ');
                const p_time = (await page.evaluate((el: Element) => (el as HTMLElement).innerText, pei_time))
                if (g_line && !g_line.includes('— 0 /Hr')) {
                    return {
                        time: w_time[2] + w_time[3] + w_time[4] + w_time[6],
                        p_time: p_time,
                        hard_1: [g_line[1], g_line[2]],
                        hard_2: [g_line[4], g_line[5]],
                        hard_3: [g_line[7], g_line[8]],
                        tm: [g_people[19], g_people[20]],
                        ins: [g_people[16], g_people[17]],
                        ex: [g_people[13], g_people[14]],
                        hc: [g_people[10], g_people[11]],
                        vh: [g_people[7], g_people[8]],
                        hd: [g_people[4], g_people[5]],
                    }
                }
                await page.close();
            } catch (e) {
                if (i == 5) {
                    logger.error("尝试" + i + "次后依旧出错" + e)
                    break
                }
                logger.error("出现错误,第" + i + "次重试" + e)
            }
        }
    }
    async function zongli_get_cn(type: number) {
        function Timestamp(Timestamp) {
            let now = new Date(Timestamp),
                y = now.getFullYear(),
                m = now.getMonth() + 1,
                d = now.getDate();
            return [y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d), now.toTimeString()]
        }
        const url_list = 'https://api.arona.icu/api/season/list'
        const url_rank = 'https://api.arona.icu/api/v2/rank/new/charts';
        const url_top = "https://api.arona.icu/api/v2/rank/list_top"
        const url_problem = 'https://api.arona.icu/api/v2/rank/list_by_last_rank'
        const head_cfg = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'ba-token uuz:uuz',
            }
        };
        try {
            const icu_list = await ctx.http.post(url_list, { "server": type }, head_cfg)
            let season = (icu_list.data.length) - 1
            let list_top = await ctx.http.post(url_top, {
                "server": type,
                "season": season
            }, head_cfg)
            if (list_top.code == 400) {
                season--
                list_top = await ctx.http.post(url_top, {
                    "server": type,
                    "season": season
                }, head_cfg)
            }
            const data = {
                "server": type,
                "season": season
            };
            const response = await ctx.http.post(url_rank, data, head_cfg);
            const porblem = await ctx.http.post(url_problem, {
                "server": type,
                "season": season,
                "dataType": 0,
                "tryNumber": 0
            }, head_cfg)
            const tp1 = !list_top.data[0] ? null : list_top.data[0]
            const tp2 = !list_top.data[1] ? null : list_top.data[1]
            const tp3 = !list_top.data[2] ? null : list_top.data[2]
            let li10k
            if (type == 1) {
                if (response.data.data.hasOwnProperty('120000')) {
                    li10k = response.data.data['10000'][response.data.data['10000'].length - 1]
                } else {
                    li10k = null
                }
            } else {
                if (response.data.data.hasOwnProperty('96000')) {
                    li10k = response.data.data['10000'][response.data.data['10000'].length - 1]
                } else {
                    li10k = null
                }
            }
            let li15_20k
            if (type == 1) {
                if (response.data.data.hasOwnProperty('15000')) {
                    li15_20k = response.data.data['15000'][response.data.data['15000'].length - 1]
                } else {
                    li15_20k = null
                }
            } else {
                if (response.data.data.hasOwnProperty('20000')) {
                    li15_20k = response.data.data['20000'][response.data.data['20000'].length - 1]
                } else {
                    li15_20k = null
                }
            }
            let li20_30k
            if (type == 1) {
                if (response.data.data.hasOwnProperty('20000')) {
                    li20_30k = response.data.data['20000'][response.data.data['20000'].length - 1]
                } else {
                    li20_30k = null
                }
            } else {
                if (response.data.data.hasOwnProperty('20000')) {
                    li20_30k = response.data.data['30000'][response.data.data['30000'].length - 1]
                } else {
                    li20_30k = null
                }
            }
            let li50_48k
            if (type == 1) {
                if (response.data.data.hasOwnProperty('50000')) {
                    li50_48k = response.data.data['50000'][response.data.data['50000'].length - 1]
                } else {
                    li50_48k = null
                }
            } else {
                if (response.data.data.hasOwnProperty('48000')) {
                    li50_48k = response.data.data['48000'][response.data.data['48000'].length - 1]
                } else {
                    li50_48k = null
                }
            }
            let li120_96k
            if (type == 1) {
                if (response.data.data.hasOwnProperty('120000')) {
                    li120_96k = response.data.data['120000'][response.data.data['120000'].length - 1]
                } else {
                    li120_96k = null
                }
            } else {
                if (response.data.data.hasOwnProperty('96000')) {
                    li120_96k = response.data.data['96000'][response.data.data['96000'].length - 1]
                } else {
                    li120_96k = null
                }
            }
            return {
                time: Timestamp(response.data.time[response.data.time.length - 1]),
                boss: icu_list.data[0],
                hard_1: !porblem.data[0] ? null : porblem.data[0],
                hard_2: !porblem.data[1] ? null : porblem.data[1],
                hard_3: !porblem.data[2] ? null : porblem.data[2],
                top_1: tp1,
                top_2: tp2,
                top_3: tp3,
                li1: response.data.data['1'][response.data.data['1'].length - 1],
                li1k: response.data.data['1000'][response.data.data['1000'].length - 1],
                li3k: response.data.data['3000'][response.data.data['3000'].length - 1],
                li5k: response.data.data['5000'][response.data.data['5000'].length - 1],
                li8k: response.data.data['8000'][response.data.data['8000'].length - 1],
                li10k: li10k,
                li15_20k: li15_20k,
                li20_30k: li20_30k,
                li50_48k: li50_48k,
                li120_96k: li120_96k
            }
        } catch (error) {
            logger.error(error);
        }
    }

    async function h_img(hard) {
        let img
        switch (hard) {
            case 'TM':
            case 'Torment':
                img = await ctx.canvas.loadImage(`${drawm}${root_img}/z_tom.png`)
                break
            case 'INS':
            case 'Insane':
                img = await ctx.canvas.loadImage(`${drawm}${root_img}/z_ins.png`)
                break
            case 'EX':
            case 'Extreme':
                img = await ctx.canvas.loadImage(`${drawm}${root_img}/z_ext.png`)
                break
            case 'HC':
            case 'HardCore':
                img = await ctx.canvas.loadImage(`${drawm}${root_img}/z_hac.png`)
                break
            case 'VH':
            case 'VeryHard':
                img = await ctx.canvas.loadImage(`${drawm}${root_img}/z_veh.png`)
                break
            case 'H':
            case 'Hard':
                img = await ctx.canvas.loadImage(`${drawm}${root_img}/z_har.png`)
                break
            case 'N':
            case 'Normal':
                img = await ctx.canvas.loadImage(`${drawm}${root_img}/z_nor.png`)
                break
        }
        return img
    }

    async function draw_list_jp(data) {
        let height: number
        height = 540
        const canvas = await ctx.canvas.createCanvas(700, height);
        const c = canvas.getContext('2d');
        const pt = await ctx.canvas.loadImage(`${drawm}${root_img}/pt.png`)
        const au = await ctx.canvas.loadImage(`${drawm}${root_img}/au.png`)
        const ag = await ctx.canvas.loadImage(`${drawm}${root_img}/ag.png`)

        async function mod_1() {
            let x = 20, rad = 20, y = 10, wid = 660, hei = 220
            c.beginPath();
            c.moveTo(x + rad, y);
            c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
            c.arcTo(x + wid, y + hei, x, y + hei, rad);
            c.arcTo(x, y + hei, x, y, rad);
            c.arcTo(x, y, x + wid, y, rad);
            c.closePath();
            c.fillStyle = '#CFDCFF';
            c.fill();
            c.restore();
            c.fillStyle = '#000000';
            c.font = `bold 28px Arial`;
            c.fillText("日服总力各档线分数", 225, 50)
            c.drawImage(pt, 50, 60)
            c.fillText(data.hard_1[0], 30, 170)
            c.fillStyle = '#01CC00';
            c.font = `bold 23px Arial`;
            c.fillText(data.hard_1[1], 50, 200)
            c.fillStyle = '#000000';
            c.font = `bold 28px Arial`;
            c.drawImage(au, 300, 60)
            c.fillText(data.hard_2[0], 270, 170)
            c.fillStyle = '#01CC00';
            c.font = `bold 23px Arial`;
            c.fillText(data.hard_2[1], 280, 200)
            c.fillStyle = '#000000';
            c.font = `bold 28px Arial`;
            c.drawImage(ag, 550, 60)
            c.fillText(data.hard_3[0], 530, 170)
            c.fillStyle = '#01CC00';
            c.font = `bold 23px Arial`;
            c.fillText(data.hard_3[1], 540, 200)
        }
        async function mod_2() {
            let x = 20, rad = 20, y = 250, wid = 660, hei = 240
            const color1 = '#004085'
            c.beginPath();
            c.moveTo(x + rad, y);
            c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
            c.arcTo(x + wid, y + hei, x, y + hei, rad);
            c.arcTo(x, y + hei, x, y, rad);
            c.arcTo(x, y, x + wid, y, rad);
            c.closePath();
            c.fillStyle = '#E0F0FF';
            c.fill();
            c.restore();
            c.fillStyle = '#000000';
            c.font = `bold 25px Arial`;
            c.fillText("日服总力各难度人数及占比", 210, 280)
            const h1 = await h_img('TM')
            c.drawImage(h1, 25, 290, 150, 60)
            c.fillText(data.tm[0], 50, 360)
            c.font = `bold 20px Arial`;
            c.fillStyle = color1;
            c.fillText(data.tm[1], 50, 380)
            c.font = `bold 25px Arial`;
            c.fillStyle = '#000000';
            const h2 = await h_img('INS')
            c.drawImage(h2, 275, 290, 150, 60)
            c.fillText(data.ins[0], 310, 360)
            c.font = `bold 20px Arial`;
            c.fillStyle = color1;
            c.fillText(data.ins[1], 310, 380)
            c.font = `bold 25px Arial`;
            c.fillStyle = '#000000';
            const h3 = await h_img('EX')
            c.drawImage(h3, 525, 290, 150, 60)
            c.fillText(data.ex[0], 550, 360)
            c.font = `bold 20px Arial`;
            c.fillStyle = color1;
            c.fillText(data.ex[1], 550, 380)
            c.font = `bold 25px Arial`;
            c.fillStyle = '#000000';
            const h4 = await h_img('HC')
            c.drawImage(h4, 25, 380, 150, 60)
            c.fillText(data.hc[0], 50, 450)
            c.font = `bold 20px Arial`;
            c.fillStyle = color1;
            c.fillText(data.hc[1], 50, 470)
            c.font = `bold 25px Arial`;
            c.fillStyle = '#000000';
            const h5 = await h_img('VH')
            c.drawImage(h5, 275, 380, 150, 60)
            c.fillText(data.vh[0], 310, 450)
            c.font = `bold 20px Arial`;
            c.fillStyle = color1;
            c.fillText(data.vh[1], 310, 470)
            c.font = `bold 25px Arial`;
            c.fillStyle = '#000000';
            const h6 = await h_img('H')
            c.drawImage(h6, 525, 380, 150, 60)
            c.fillText(data.hd[0], 550, 450)
            c.font = `bold 20px Arial`;
            c.fillStyle = color1;
            c.fillText(data.hd[1], 550, 470)
            c.font = `bold 25px Arial`;
            c.fillStyle = '#000000';
        }
        c.fillStyle = '#FFFFFF';
        c.fillRect(0, 0, 700, height);
        c.fillStyle = '#000000';
        c.font = `bold 20px Arial`;
        c.fillText("数据来源:https://arona.ai", 20, 520)
        c.fillText("更新时间：" + data.time, 300, 520)
        await mod_1()
        await mod_2()
        c.beginPath();
        c.stroke();
        const img = await canvas.toBuffer("image/png")
        fmp.img_save(img, root_act, "list_jp.png")
        return (root_act + "/list_jp.png")
    }

    async function draw_list(data, type: number) {
        let height: number
        height = 900
        const canvas = await ctx.canvas.createCanvas(700, height);
        const c = canvas.getContext('2d');
        const pt = await ctx.canvas.loadImage(`${drawm}${root_img}/pt.png`)
        const au = await ctx.canvas.loadImage(`${drawm}${root_img}/au.png`)
        const ag = await ctx.canvas.loadImage(`${drawm}${root_img}/ag.png`)
        async function mod_1() {
            let x = 20, rad = 20, y = 10, wid = 660, hei = 250
            c.beginPath();
            c.moveTo(x + rad, y);
            c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
            c.arcTo(x + wid, y + hei, x, y + hei, rad);
            c.arcTo(x, y + hei, x, y, rad);
            c.arcTo(x, y, x + wid, y, rad);
            c.closePath();
            c.fillStyle = '#CFDCFF';
            c.fill();
            c.restore();
            c.fillStyle = '#000000';
            c.font = `bold 30px Arial`;
            c.fillText("各档线分数", 275, 50)
            if (data.top_1 == null) {
                c.drawImage(pt, 50, 60)
                c.fillText('暂无信息', 30, 170)
                c.fillStyle = '#00687D';
                c.font = `bold 25px Arial`;
                c.fillText('暂无信息', 45, 200)
            } else {
                c.drawImage(pt, 50, 60)
                c.fillText(data.top_1.bestRankingPoint, 30, 170)
                c.fillStyle = '#00687D';
                c.font = `bold 25px Arial`;
                c.fillText(data.top_1.battleTime, 45, 200)
                const h1 = await h_img(data.top_1.hard)
                c.drawImage(h1, 25, 195, 150, 60)
            }
            if (data.top_2 == null) {
                c.drawImage(au, 300, 60)
                c.fillText('暂无信息', 290, 170)
                c.fillStyle = '#00687D';
                c.font = `bold 25px Arial`;
                c.fillText('暂无信息', 295, 200)
            } else {
                c.fillStyle = '#000000';
                c.font = `bold 30px Arial`;
                c.drawImage(au, 300, 60)
                c.fillText(data.top_2.bestRankingPoint, 290, 170)
                c.fillStyle = '#00687D';
                c.font = `bold 25px Arial`;
                c.fillText(data.top_2.battleTime, 295, 200)
                const h2 = await h_img(data.top_2.hard)
                c.drawImage(h2, 275, 195, 150, 60)
                c.fillStyle = '#000000';
                c.font = `bold 30px Arial`;
            }
            if (data.top_3 == null) {
                c.drawImage(ag, 550, 60)
                c.fillText('暂无信息', 550, 170)
                c.fillStyle = '#00687D';
                c.font = `bold 25px Arial`;
                c.fillText('暂无信息', 545, 200)
            } else {
                c.drawImage(ag, 550, 60)
                c.fillText(data.top_3.bestRankingPoint, 550, 170)
                c.fillStyle = '#00687D';
                c.font = `bold 25px Arial`;
                c.fillText(data.top_3.battleTime, 545, 200)
                const h3 = await h_img(data.top_3.hard)
                c.drawImage(h3, 525, 195, 150, 60)
            }
        }
        async function mod_2() {
            let x = 20, rad = 20, y = 270, wid = 660, hei = 140
            c.beginPath();
            c.moveTo(x + rad, y);
            c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
            c.arcTo(x + wid, y + hei, x, y + hei, rad);
            c.arcTo(x, y + hei, x, y, rad);
            c.arcTo(x, y, x + wid, y, rad);
            c.closePath();
            c.fillStyle = '#E0F0FF';
            c.fill();
            c.restore();
            c.fillStyle = '#000000';
            c.font = `bold 25px Arial`;
            c.fillText("各难度最低排名", 270, 305)
            //not test
            if (!data.hard_1) {
                c.fillText("暂无数据呜", 60, 380)
            } else {
                const h1 = await h_img(data.hard_1.hard)
                c.drawImage(h1, 25, 310, 150, 60)
                c.fillText(data.hard_1.rank, 60, 380)
            }
            if (!data.hard_2) {
                c.fillText("暂无数据呜", 310, 380)
            } else {
                const h2 = await h_img(data.hard_2.hard)
                c.drawImage(h2, 275, 310, 150, 60)
                c.fillText(data.hard_2.rank, 310, 380)
            }
            if (!data.hard_3) {
                c.fillText("暂无数据呜", 540, 380)
            } else {
                const h3 = await h_img(data.hard_3.hard)
                c.drawImage(h3, 525, 310, 150, 60)
                c.fillText(data.hard_3.rank, 560, 380)
            }
        }
        async function mod_3(type) {
            let x = 20, rad = 20, y = 420, wid = 360, hei = 430
            c.beginPath();
            c.moveTo(x + rad, y);
            c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
            c.arcTo(x + wid, y + hei, x, y + hei, rad);
            c.arcTo(x, y + hei, x, y, rad);
            c.arcTo(x, y, x + wid, y, rad);
            c.closePath();
            c.fillStyle = '#FFDFFC';
            c.fill();
            c.restore();
            c.fillStyle = '#000000';
            c.font = `bold 25px Arial`;
            c.fillText('第1:', 60, 460)
            c.fillText('第1000:', 60, 500)
            c.fillText('第3000:', 60, 540)
            c.fillText('第5000:', 60, 580)
            c.fillText('第8000:', 60, 620)
            c.fillText('第10000:', 60, 660)
            c.fillText(type == 1 ? '第15000:' : '第20000:', 60, 700)
            c.fillText(type == 1 ? '第20000:' : '第30000:', 60, 740)
            c.fillText(type == 1 ? '第50000:' : '第48000:', 60, 780)
            c.fillText(type == 1 ? '第120000:' : '第96000:', 60, 820)
            c.fillStyle = '#36007D';
            c.font = `bold 25px Arial`;
            c.fillText(data.li1, 220, 460)
            c.fillText(data.li1k, 220, 500)
            c.fillText(data.li3k, 220, 540)
            c.fillText(data.li5k, 220, 580)
            if (type == 2) {
                c.fillStyle = '#665B00';
                c.font = `bold 25px Arial`;
            }
            c.fillText(data.li8k, 220, 620)
            if (!data.li10k) {
                c.fillText("暂无数据呜", 220, 660)
            } else {
                c.fillText(data.li10k, 220, 660)
            }
            if (!data.li15_20k) {
                c.fillText("暂无数据呜", 220, 700)
            } else {
                c.fillText(data.li15_20k, 220, 700)
            }
            c.fillStyle = '#665B00';
            c.font = `bold 25px Arial`;
            if (!data.li20_30k) {
                c.fillText("暂无数据咪", 220, 740)
            } else {
                c.fillText(data.li20_30k, 220, 740)
            }
            if (type == 2) {
                c.fillStyle = '#4A4A4A';
                c.font = `bold 25px Arial`;
            }
            if (!data.li50_48k) {
                c.fillText("暂无数据喵", 220, 780)
            } else {
                c.fillText(data.li50_48k, 220, 780)
            }
            c.fillStyle = '#4A4A4A';
            c.font = `bold 25px Arial`;
            if (!data.li120_96k) {
                c.fillText("暂无数据咪", 220, 820)
            } else {
                c.fillText(data.li120_96k, 220, 820)
            }
            c.fillStyle = '#000000';
            c.font = `bold 25px Arial`;
            c.fillText("数据来源：什亭之匣 https://arona.icu", 20, 880)
        }
        async function mod_4() {
            let x = 390, rad = 20, y = 420, wid = 290, hei = 265
            c.beginPath();
            c.moveTo(x + rad, y);
            c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
            c.arcTo(x + wid, y + hei, x, y + hei, rad);
            c.arcTo(x, y + hei, x, y, rad);
            c.arcTo(x, y, x + wid, y, rad);
            c.closePath();
            c.fillStyle = '#FFE6E6';
            c.fill();
            c.restore();
            c.fillStyle = '#000000';
            c.font = `bold 20px Arial`;
            c.fillText('更新时间：', 400, 455)
            c.font = `bold 23px Arial`;
            c.fillStyle = '#002E6B'
            c.fillText(data.time[0], 400, 480)
            const timeWithoutTimeZone = data.time[1].replace(/ \([^)]+\)/, '');
            const timeMatch = data.time[1].match(/ \(([^)]+)\)/);
            const timeZone = timeMatch ? timeMatch[1] : '未匹配到时区';
            c.fillText(timeWithoutTimeZone, 400, 510)
            c.fillText(timeZone, 400, 530)
            c.fillStyle = '#000000'
            c.font = `bold 20px Arial`;
            const serv = type == 1 ? "官服" : "B服"
            c.fillStyle = '#5C0C0C'
            c.fillText(serv + '当前总力：', 400, 560)
            c.fillStyle = '#000000'
            c.fillText('第' + data.boss.season + '期', 400, 585)
            c.fillText(data.boss.map.value, 400, 610)
            c.fillText(data.boss.boss, 450, 610)
            c.fillText("开始：" + data.boss.startTime, 400, 645)
            c.fillText("结束：" + data.boss.endTime, 400, 670)
        }
        async function mod_5() {
            const i = random.int(1, 15)
            const image = await ctx.canvas.loadImage(`${drawm}${root_img}/meme_${i}.png`)
            console.log(image)
            let newWidth, newHeight, maxWidth = 180, maxHeight = 180
            let wids = config.plugin_config.draw_modle == "canvas" ? 'width' : 'naturalWidth'
            let heis = config.plugin_config.draw_modle == "canvas" ? 'height' : 'naturalHeight'
            const originalWidth = image[wids];
            const originalHeight = image[heis];
            const widthRatio = maxWidth / originalWidth;
            const heightRatio = maxHeight / originalHeight;
            const scale = Math.min(widthRatio, heightRatio, 1); // 添加1确保图像不会放大
            newWidth = originalWidth * scale;
            newHeight = originalHeight * scale;
            let x = 460, rad = 20, y = 700, wid = newWidth, hei = newHeight
            c.beginPath();
            c.moveTo(x + rad, y);
            c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
            c.arcTo(x + wid, y + hei, x, y + hei, rad);
            c.arcTo(x, y + hei, x, y, rad);
            c.arcTo(x, y, x + wid, y, rad);
            c.clip();
            c.drawImage(image, 460, 700, newWidth, newHeight)
            c.stroke()
            c.closePath();
        }
        //乱，但是能跑就行
        c.fillStyle = '#FFFFFF';
        c.fillRect(0, 0, 700, height);
        c.fillStyle = '#000000';
        c.font = `bold 30px Arial`;
        await mod_1()
        await mod_2()
        await mod_3(type)
        await mod_4()
        await mod_5()
        c.beginPath();
        c.stroke();
        const img = await canvas.toBuffer("image/png")
        fmp.img_save(img, root_act, "list_cn_" + type + ".png")
        return (root_act + "/list_cn_" + type + ".png")
    }

    async function draw_dajuezhan(data) {
        let height: number
        height = 320
        const canvas = await ctx.canvas.createCanvas(700, height);
        const c = canvas.getContext('2d');
        const pt = await ctx.canvas.loadImage(`${drawm}${root_img}/pt.png`)
        const au = await ctx.canvas.loadImage(`${drawm}${root_img}/au.png`)
        const ag = await ctx.canvas.loadImage(`${drawm}${root_img}/ag.png`)
        async function mod_1() {
            let x = 10, rad = 20, y = 10, wid = 680, hei = 220
            c.beginPath();
            c.moveTo(x + rad, y);
            c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
            c.arcTo(x + wid, y + hei, x, y + hei, rad);
            c.arcTo(x, y + hei, x, y, rad);
            c.arcTo(x, y, x + wid, y, rad);
            c.closePath();
            c.fillStyle = '#AAE6D1';
            c.fill();
            c.restore();
            c.fillStyle = '#000000';
            c.font = `bold 28px Arial`;
            c.fillText("日服大决战各档线分数", 225, 50)
            c.drawImage(pt, 50, 60)
            c.fillText(data.hard_1[0], 30, 170)
            c.fillStyle = '#01CC00';
            c.font = `bold 23px Arial`;
            c.fillText(data.hard_1[1], 40, 200)
            c.fillStyle = '#000000';
            c.font = `bold 28px Arial`;
            c.drawImage(au, 300, 60)
            c.fillText(data.hard_2[0], 270, 170)
            c.fillStyle = '#01CC00';
            c.font = `bold 23px Arial`;
            c.fillText(data.hard_2[1], 270, 200)
            c.fillStyle = '#000000';
            c.font = `bold 28px Arial`;
            c.drawImage(ag, 550, 60)
            c.fillText(data.hard_3[0], 530, 170)
            c.fillStyle = '#01CC00';
            c.font = `bold 23px Arial`;
            c.fillText(data.hard_3[1], 530, 200)
        }
        c.fillStyle = '#FFFFFF';
        c.fillRect(0, 0, 700, height);
        c.fillStyle = '#000000';
        c.font = `bold 23px Arial`;
        c.fillText("数据来源:https://arona.ai", 20, 280)
        c.fillText("更新时间：" + data.time, 320, 280)
        await mod_1()
        c.beginPath();
        c.stroke();
        const img = await canvas.toBuffer("image/png")
        fmp.img_save(img, root_act, "dajuezhan_jp.png")
        return (root_act + "/dajuezhan_jp.png")
    }

    const cacheInstances = {};
    /**gpt4
     * @param type B2 官1
     */
    function getCacheFunction(type) {
        // 如果已经有这个type的缓存函数实例，直接返回它
        if (cacheInstances[type]) {
            return cacheInstances[type];
        }
        // 否则，创建一个新的缓存函数实例
        let cache = null;
        let cacheTime = null;
        const cacheDuration = 2 * 60 * 1000; // 2分钟

        const cacheFunction = async function () {
            const now = new Date().getTime();
            // 检查是否有缓存以及缓存是否过期
            if (cache !== null && (now - cacheTime) < cacheDuration) {
                console.log("返回缓存结果");
                return cache;
            }
            console.log("调用原函数");
            const func = await zongli_get_cn(type);
            cache = await draw_list(func, type); // 假设a是异步函数
            cacheTime = now; // 更新缓存时间
            return cache;
        };
        // 将这个新的缓存函数实例存储起来
        cacheInstances[type] = cacheFunction;
        return cacheFunction;
    }

    let cacheFunctionInstance = null;
    async function getCache_jp() {
        // 如果已经有缓存函数实例，直接返回它
        if (cacheFunctionInstance) {
            return cacheFunctionInstance;
        }
        let cache = null;
        let cacheTime = null;
        const cacheDuration = 5 * 60 * 1000; // 5分钟
        const cacheFunction = async function () {
            const now = new Date().getTime();
            // 检查是否有缓存以及缓存是否过期
            if (cache !== null && (now - cacheTime) < cacheDuration) {
                console.log("返回缓存结果");
                return cache;
            }
            console.log("调用原函数");
            const func = await zongli_get_jp();
            cache = await draw_list_jp(func); // 假设是异步函数
            cacheTime = now; // 更新缓存时间
            return cache;
        };
        // 存储新的缓存函数实例
        cacheFunctionInstance = cacheFunction;
        return cacheFunction;
    }

    let cacheFunction_dajuezhan = null;
    async function getCache_dajuezhan() {
        // 如果已经有缓存函数实例，直接返回它
        if (cacheFunction_dajuezhan) {
            return cacheFunction_dajuezhan;
        }
        let cache = null;
        let cacheTime = null;
        const cacheDuration = 5 * 60 * 1000; // 5分钟
        const cacheFunction = async function () {
            const now = new Date().getTime();
            // 检查是否有缓存以及缓存是否过期
            if (cache !== null && (now - cacheTime) < cacheDuration) {
                console.log("返回缓存结果");
                return cache;
            }
            console.log("调用原函数");
            const func = await 大决战获取();
            cache = await draw_dajuezhan(func); // 假设是异步函数
            cacheTime = now; // 更新缓存时间
            return cache;
        };
        // 存储新的缓存函数实例
        cacheFunction_dajuezhan = cacheFunction;
        return cacheFunction;
    }

    ctx.i18n.define('zh-CN', require('../locales/zh-CN'))
    ctx.command('总力档线 <message:text>', '总力站信息查询')
        .alias("总力")
        .action(async ({ session }, message) => {
            if (session.event.platform == 'qq' && mdswitch) {
                if (!message) {
                    try {
                        await session.qq.sendMessage(session.channelId, markdown(session))
                    } catch (e) {
                        logger.info('发送md时发生错误', e)
                        return ("总力战档线查询，支持日服、国服官服、国服B服\n"
                            + "还支持大决战查询哦\n"
                            + "使用方法：\n"
                            + "🟢@机器人并发送:/总力档线+空格+服务器"
                        )
                    }
                }
                if (/日/.test(message)) {
                    try {
                        session.send(session.text('.wait'))
                        const cacheFunction = await getCache_jp();
                        const result = await cacheFunction();
                        return (h.image(pathToFileURL(resolve(result)).href))
                    } catch (e) {
                        logger.info(e)
                        return session.text('.error')
                    }
                } else if (/b/.test(message) || /B/.test(message)) {
                    try {
                        const cacheFunction = getCacheFunction(2);
                        const paths = await cacheFunction();
                        return (h.image(pathToFileURL(resolve(paths)).href))
                    } catch (e) {
                        logger.info(e)
                        return session.text('.error')
                    }
                } else {
                    try {
                        const cacheFunction = getCacheFunction(1);
                        const paths = await cacheFunction();
                        return (h.image(pathToFileURL(resolve(paths)).href))
                    } catch (e) {
                        logger.info(e)
                        return session.text('.error')
                    }
                }
            } else {
                if (!message) {
                    try {
                        const cacheFunction = await getCacheFunction(1);
                        console.log(cacheFunction)
                        const paths = await cacheFunction();
                        console.log(paths)
                        session.send(h.image(pathToFileURL(resolve(paths)).href))
                        return ("总力战档线查询，支持日服、国服官服、国服B服\n"
                            + "使用方法：\n"
                            + "🟢总力档线+空格+服务器"
                        )
                    } catch (e) {
                        logger.info(e)
                        return session.text('.error')
                    }
                } else {
                    if (/日/.test(message)) {
                        try {
                            session.send("请老师稍等哦，正在获取数据")
                            const cacheFunction = await getCache_jp();
                            const result = await cacheFunction();
                            return (h.image(pathToFileURL(resolve(result)).href))
                        } catch (e) {
                            logger.info(e)
                            return session.text('.error')
                        }
                    } else if (/b/.test(message) || /B/.test(message)) {
                        try {
                            const cacheFunction = getCacheFunction(2);
                            const paths = await cacheFunction();
                            return (h.image(pathToFileURL(resolve(paths)).href))
                        } catch (e) {
                            logger.info(e)
                            return session.text('.error')
                        }
                    } else {
                        try {
                            const cacheFunction = await getCacheFunction(1);
                            console.log(cacheFunction)
                            const paths = await cacheFunction();
                            console.log(paths)
                            return (h.image(pathToFileURL(resolve(paths)).href))
                        } catch (e) {
                            logger.info(e)
                            return session.text('.error')
                        }
                    }
                }
            }
        })

    ctx.command("大决战档线")
        .alias("大决战")
        .action(async ({ session }) => {
            try {
                session.send(session.text('.wait'))
                const cacheFunction = await getCache_dajuezhan();
                const result = await cacheFunction();
                return (h.image(pathToFileURL(resolve(result)).href))
            } catch (e) {
                logger.info(e)
                return session.text('.error')
            }
        })
    //————————————————————————————————————————————————————bawiki的活动获取————————————————————————————————
    const A = 0.6//分辨率
    async function draw_active(wiki_data) {
        function jud_time(begin_at) {
            const now = Math.floor(Date.now() / 1000);
            if (begin_at > now) {
                return false
            } else {
                return true
            }
        }
        function calculateTime(begin_at, end_at) {
            const date_end = new Date(begin_at * 1000);
            const date_be = new Date(end_at * 1000);
            const year_be = date_be.getFullYear();
            const year_end = date_end.getFullYear();
            const month_be = date_be.getMonth() + 1;
            const month_end = date_end.getMonth() + 1;
            const day_be = date_be.getDate();
            const day_end = date_end.getDate();
            const hours_be = date_be.getHours();
            const hours_end = date_end.getHours();
            const minutes_be = date_be.getMinutes();
            const minutes_end = date_end.getMinutes();
            const now = Math.floor(Date.now() / 1000);
            const remainingTimeInSeconds = end_at - now;
            const howlong = begin_at - now;
            const lday = Math.floor(howlong / (3600 * 24));
            const lhour = Math.floor((howlong % (3600 * 24)) / 3600);
            const lmin = Math.floor((howlong % 3600) / 60);
            const remainingDays = Math.floor(remainingTimeInSeconds / (3600 * 24));
            const remainingHours = Math.floor((remainingTimeInSeconds % (3600 * 24)) / 3600);
            const remainingMinutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
            let remainingString = ''
            let type = ''
            if (remainingTimeInSeconds > 0) {
                if (howlong > 0) {
                    type = '还有:'
                    remainingString = `${lday}天${lhour}小时${lmin}分`
                } else {
                    type = '还剩:'
                    remainingString = `${remainingDays}天${remainingHours}小时${remainingMinutes}分`
                }
            } else {
                remainingString = '已结束'
            }
            const be_time = `${year_be}年 ${month_be}月 ${day_be}日 ${hours_be}时 ${minutes_be}分`
            const end_time = `${year_end}年 ${month_end}月 ${day_end}日 ${hours_end}时 ${minutes_end}分`
            return [end_time, be_time, type, remainingString]
        }

        function insertLineBreaks(str: string, maxLength: number): string {
            let result = '';
            let currentLine = '';
            for (const char of str) {
                if (currentLine.length < maxLength) {
                    currentLine += char;
                } else {
                    result += currentLine + '\n';
                    currentLine = char;
                }
            }
            result += currentLine; // 添加最后一行
            return result;
        }
        let acvimg = []
        let yls = 30 * A, yrs = 30 * A
        let s = 0
        for (let i = 0; i < wiki_data.data.length; i++) {
            if (!(wiki_data.data[i].picture == '')) {
                // 拼接后端反代url
                let pictureUrl = `https:${wiki_data.data[i].picture}`
                let proxyPicture = `http://localhost:9191/proxyImage?url=${pictureUrl}`
                acvimg.push(await ctx.canvas.loadImage(proxyPicture))
                let drawm_hei;
                config.plugin_config.draw_modle == "canvas" ? drawm_hei = 'height' : drawm_hei = 'naturalHeight'
                const m = 260 / acvimg[i - s][drawm_hei]
                const hei = acvimg[i - s][drawm_hei] * m
                jud_time(wiki_data.data[i].begin_at) ? yls += (hei + 160 * A) : yrs += (hei + 160 * A)
            } else {
                jud_time(wiki_data.data[i].begin_at) ? yls += (140 * A) : yrs += (140 * A)
                s++
            }
        }

        let height;
        yls > yrs ? height = yls : height = yrs
        const canvas = await ctx.canvas.createCanvas(1600 * A, (height + 450) * (A * 1.35));///分辨率倍率最好要算，没写
        const c = canvas.getContext('2d');
        c.fillStyle = '#FFFFFF';
        c.fillRect(0, 0, 1600 * A, (height + 500) * (A * 1.35));
        let x = 30 * A, rad = 20 * A, y = 30 * A, wid = 700 * A, hei = 150 * A, color = '', yl = 230 * A, yr = 230 * A

        c.beginPath();
        c.moveTo(x + rad, y);
        c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
        c.arcTo(x + wid, y + hei, x, y + hei, rad);
        c.arcTo(x, y + hei, x, y, rad);
        c.arcTo(x, y, x + wid, y, rad);
        //c.stroke()//路径
        c.closePath();
        c.fillStyle = '#C9FFB0';
        c.fill();
        c.restore();
        c.fillStyle = '#000000';
        c.font = `bold ${50 * A}px Arial`;
        c.fillText('进行中', (x + 50) * A, (y + 90) * A)
        c.fillStyle = '#000000';
        c.font = `bold ${40 * A}px Arial`;
        c.fillText('当前时间：', (x + 300) * A, (y + 60) * A)
        c.fillText(new Date().toLocaleString(), (x + 300) * A, (y + 100) * A)
        let xr = 800 * A
        c.beginPath();
        c.moveTo(xr + rad, y);
        c.arcTo(xr + wid, y, xr + wid, y + hei, rad); // 右上角
        c.arcTo(xr + wid, y + hei, xr, y + hei, rad);
        c.arcTo(xr, y + hei, xr, y, rad);
        c.arcTo(xr, y, xr + wid, y, rad);
        //c.stroke()//路径
        c.closePath();
        c.fillStyle = '#FFF1B3';
        c.fill();
        c.restore();
        c.fillStyle = '#000000';
        c.font = `bold ${50 * A}px Arial`;
        c.fillText('即将开始：', (xr + 50 * A), (y + 90) * A)

        let ss = 0, ypush = 0
        for (let i = 0; i < wiki_data.data.length; i++) {
            ypush = 0
            const timetemp = calculateTime(wiki_data.data[i].begin_at, wiki_data.data[i].end_at)
            const swin = wiki_data.data[i].pub_area + jud_time(wiki_data.data[i].begin_at)
            switch (swin) {
                case '日服true': color = '#EBDBFF'; x = 30 * A; y = yl; break
                case '日服false': color = '#D8C8ED'; x = 800 * A; y = yr; break
                case '国际服true': color = '#D4ECFF'; x = 30 * A; y = yl; break
                case '国际服false': color = '#ABC2E3'; x = 800 * A; y = yr; break
                case '国服true': color = '#FFD8D8'; x = 30 * A; y = yl; break
                case '国服false': color = '#E5ADAD'; x = 800 * A; y = yr; break
            }
            if (!(wiki_data.data[i].picture == '')) {

                let drawm_hei;
                config.plugin_config.draw_modle == "canvas" ? drawm_hei = 'height' : drawm_hei = 'naturalHeight'
                let drawm_wid;
                config.plugin_config.draw_modle == "canvas" ? drawm_wid = 'width' : drawm_wid = 'naturalWidth'
                const m = 250 * A / acvimg[i - ss][drawm_hei]
                const hei = acvimg[i - ss][drawm_hei] * m
                const widimg = acvimg[i - ss][drawm_wid] * m
                const move = 150 * A
                c.beginPath();
                c.moveTo(x + rad, y);
                c.arcTo(x + wid, y, x + wid + move, y + hei + move, rad); // 右上角
                c.arcTo(x + wid, y + hei + move, x + move, y + hei + move, rad);
                c.arcTo(x, y + hei + move, x, y, rad);
                c.arcTo(x, y, x + wid, y, rad);
                //c.stroke()//路径
                c.closePath();
                c.fillStyle = color;
                c.fill();
                c.restore();
                if (wiki_data.data[i].title.length > 32) {
                    ypush = 20 * A
                    y += ypush
                    c.drawImage(acvimg[i - ss], x + 30 * A, y + 50 * A, widimg, hei)
                    y -= ypush
                } else {
                    c.drawImage(acvimg[i - ss], x + 30 * A, y + 50 * A, widimg, hei)
                }
                c.fillStyle = '#001D42';
                c.font = `bold ${21 * A}px Arial`;
                c.fillText('开始时间：' + timetemp[0], x + 50 * A, y + hei + 80 * A + ypush)
                c.fillStyle = '#420000';
                c.fillText('结束时间：' + timetemp[1], x + 50 * A, y + hei + 110 * A + ypush)

                c.fillStyle = '#000000';
                c.font = `bold ${30 * A}px Arial`;
                c.fillText(timetemp[2], x + 450 * A, y + hei + 90 * A)

                if (timetemp[2] == '还有:') {
                    c.fillStyle = '#A30000';
                } else {
                    c.fillStyle = '#005AA3';
                }
                c.fillText(timetemp[3], x + 450 * A, y + hei + 120 * A)

                jud_time(wiki_data.data[i].begin_at) ? yl += (hei) : yr += (hei)
            } else {
                ss++
                c.beginPath();
                c.moveTo(x + rad, y);
                c.arcTo(x + wid, y, x + wid, y + hei, rad); // 右上角
                c.arcTo(x + wid, y + hei, x, y + hei, rad);
                c.arcTo(x, y + hei, x, y, rad);
                c.arcTo(x, y, x + wid, y, rad);
                c.closePath();
                c.fillStyle = color;
                c.fill();
                c.restore();
                c.fillStyle = '#001D42';
                c.font = `bold ${21 * A}px Arial`;
                c.fillText('开始时间：' + timetemp[0], x + 50 * A, y + 90 * A)
                c.fillStyle = '#420000';
                c.fillText('结束时间：' + timetemp[1], x + 50 * A, y + 120 * A)

                c.fillStyle = '#000000';
                c.font = `bold ${30 * A}px Arial`;
                c.fillText(timetemp[2], x + 450 * A, y + 90 * A)

                if (timetemp[2] == '还有:') {
                    c.fillStyle = '#A30000';
                } else {
                    c.fillStyle = '#005AA3';
                }
                c.fillText(timetemp[3], x + 450 * A, y + 120 * A)

            }
            c.fillStyle = '#000000';
            c.font = `bold ${25 * A}px Arial`;
            const lines = insertLineBreaks(wiki_data.data[i].title, 32).split('\n');
            let ytext = y + 30 * A;
            const lineHeight = 30 * A; // 假设每行的高度是 20px
            for (const line of lines) {
                c.fillText(line, x, ytext);
                ytext += lineHeight;
            }

            jud_time(wiki_data.data[i].begin_at) ? yl += 155 * A : yr += 155 * A

        }
        const img = canvas.toDataURL("image/png")
        return img
    }

    let cachedImageGeneratorInstance: (() => Promise<string>) | null = null;

    async function createCachedImageGenerator(wiki_data): Promise<() => Promise<string>> {
        // 如果已经有缓存函数实例，直接返回它
        if (await cachedImageGeneratorInstance) {
            return await cachedImageGeneratorInstance;
        }

        let cache: string | null = null;
        let cacheTime: number | null = null;
        const cacheDuration = 2 * 60 * 1000; // 2分钟

        const cachedImageGenerator = async function (): Promise<string> {
            const now = new Date().getTime();
            // 检查是否有缓存以及缓存是否过期
            if (cache !== null && cacheTime !== null && (now - cacheTime) < cacheDuration) {
                console.log("使用缓存");
                return cache;
            }
            console.log("缓存刷新或创建");
            // 假设 draw_active 是一个异步函数，返回一个 Promise<string>
            cache = await draw_active(wiki_data);
            cacheTime = now; // 更新缓存时间
            return cache;
        };

        // 存储新的缓存函数实例
        cachedImageGeneratorInstance = await cachedImageGenerator;
        return cachedImageGenerator;
    }
    logger.info("🟢 总力获取加载完毕")

    ctx.command('活动日程', 'ba活动查询')
        .alias("活动")
        .action(async ({ session }) => {
            const utimetamp = Math.floor(Date.now() / 1000);
            // 获取日服，国服，国际服的wiki_data
            const j_wiki_data = await ctx.http.get(`https://www.gamekee.com/v1/activity/page-list?importance=0&sort=-1&keyword=&limit=999&page_no=1&serverId=15&status=0`, {
              headers: {
                "game-alias": "ba"
              }
            })
            const c_wiki_data = await ctx.http.get(`https://www.gamekee.com/v1/activity/page-list?importance=0&sort=-1&keyword=&limit=999&page_no=1&serverId=16&status=0`, {
              headers: {
                "game-alias": "ba"
              }
            })
            const g_wiki_data = await ctx.http.get(`https://www.gamekee.com/v1/activity/page-list?importance=0&sort=-1&keyword=&limit=999&page_no=1&serverId=17&status=0`, {
              headers: {
                "game-alias": "ba"
              }
            })
            let wiki_data = {
              "code": 0,
              "msg": "",
              "data": [...j_wiki_data.data, ...c_wiki_data.data, ...g_wiki_data.data].filter(item => item.end_at >= Date.now() / 1000)
            }
            const cachedGenerator = await (await createCachedImageGenerator(wiki_data))()
            session.send(await h.image(await cachedGenerator))
        })

    logger.info('🟢 活动获取功能加载完毕')


}
