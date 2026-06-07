package main

import (
	"fmt"
	"image/png"
	"io"
	"net/http"
	"strings"

	"golang.org/x/image/webp" // 需要安装：go get golang.org/x/image/webp
)

var headers http.Header = http.Header{
	"Game-Alias":         []string{"ba"},
	"Origin":             []string{"https://www.gamekee.com"},
	"Referer":            []string{"https://www.gamekee.com/"},
	"User-Agent":         []string{"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"},
	"Accept":             []string{"application/json, text/plain, */*"},
	"Accept-Language":    []string{"zh-CN,zh;q=0.9,en;q=0.8"},
	"Sec-CH-UA":          []string{"\"Chromium\";v=\"148\", \"Microsoft Edge\";v=\"148\", \"Not/A)Brand\";v=\"99\""},
	"Sec-CH-UA-Mobile":   []string{"?0"},
	"Sec-CH-UA-Platform": []string{"\"Windows\""},
	"Sec-Fetch-Dest":     []string{"empty"},
	"Sec-Fetch-Mode":     []string{"cors"},
	"Sec-Fetch-Site":     []string{"same-site"},
	"Priority":           []string{"u=1, i"},
	"Cookie":             []string{"wk_uuid=dec65dd4-b56a-46fa-b9df-b41c6b22d03e; _ga=GA1.1.1484824820.1776000263; viewport_height=732; wikiTheme=light; _c_WBKFRo=uhZADd3dh4qUUahHhbh2Pl3124Tb73KQRdiq3MJH; Hm_lvt_4e86461ca95817a955a0fd34fef28c67=1776579050,1776669128,1778484447,1778500494; HMACCOUNT=E02F7FD111A7340D; __qc_wId=402; ba_server_id=15; viewport_width=866; Hm_lpvt_4e86461ca95817a955a0fd34fef28c67=1778508662; _ga_4M9R3LQQS5=GS2.1.s1778508660$o8$g1$t1778508662$j58$l0$h0"},
}

func proxyImage(w http.ResponseWriter, r *http.Request) {
	imageURL := r.URL.Query().Get("url")
	fmt.Println("imageURL:", imageURL)
	if imageURL == "" {
		http.Error(w, "Missing 'url' query parameter", http.StatusBadRequest)
		return
	}

	req, _ := http.NewRequest("GET", imageURL, nil)
	req.Header = headers

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")

	// 如果是 WebP，转换为 PNG
	if strings.Contains(contentType, "webp") {
		// 解码 WebP
		img, err := webp.Decode(resp.Body)
		if err != nil {
			http.Error(w, "Failed to decode WebP", http.StatusInternalServerError)
			return
		}

		// 编码为 PNG
		w.Header().Set("Content-Type", "image/png")
		err = png.Encode(w, img)
		if err != nil {
			http.Error(w, "Failed to encode PNG", http.StatusInternalServerError)
			return
		}
		return
	}

	// 非 WebP 直接转发
	w.Header().Set("Content-Type", contentType)
	io.Copy(w, resp.Body)
}

func main() {
	http.HandleFunc("/proxyImage", proxyImage)
	http.ListenAndServe(":9191", nil)
}
