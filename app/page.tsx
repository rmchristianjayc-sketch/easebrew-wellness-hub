"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ============================================================
// ⚙️ CONFIG — I-update ang mga links na ito
// ============================================================
const ORDER_URL = "https://YOUR_ORDER_LINK_HERE";               // ← palitan ng actual order/shopee/lazada link
const BAGONG_KATAWAN_ORDER_URL = "https://YOUR_ORDER_LINK_HERE"; // ← para sa ₱499 program checkout

// YouTube Video IDs — palitan ng actual video IDs
const VIDEOS = [
  {
    id: "YOUR_VIDEO_ID_1",
    title: "Paano I-prepare ang Easebrew",
    desc: "Ang tamang paraan para ma-maximize ang herbal benefits ng Easebrew.",
  },
  {
    id: "YOUR_VIDEO_ID_2",
    title: "Paano Mag-massage ng Avocado Oil",
    desc: "Step-by-step massage technique para sa joint pain relief.",
  },
  {
    id: "YOUR_VIDEO_ID_3",
    title: "Simple Exercises para sa Joint Pain",
    desc: "Low-impact exercises na safe para sa matatanda at may arthritis.",
  },
];

// ============================================================
// 👥 AGENT DIRECTORY
// ============================================================
const AGENTS = [
  {
    name: "Coach Josephine",
    number: "0917 701 1252",
    facebook: "https://www.facebook.com/josephine.easebrew.main",
    fbName: "Josephine Easebrew Main",
    photo: "data:image/jpeg;base64,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",
  },
  {
    name: "Coach Nino",
    number: "0968 880 4440",
    facebook: "https://www.facebook.com/easebrew.nina",
    fbName: "Easebrew Niña",
    photo: "data:image/jpeg;base64,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",
  },
  {
    name: "Coach Mark",
    number: "0917 117 8216",
    facebook: "https://www.facebook.com/profile.php?id=61577427472374",
    fbName: "RM Mark",
    photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAB4AHgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3PFGKXFFACUUtJQAUUVBe3trp1nLd3tzFbW0Q3PLK4VVHuTQBPiivDvEvx+xPJa+GdOWRVbAvLvOGHqsY/qfwrG0n44eJbe6VtRWzvISfni8oRtj/AGWHT8QaAPoqisDQvGnh/wARusWm6nBJcmMSG3JxIoxzweuO+M10FACUUtFACUYpaXFADcUU6igAxRTsUlACUlLRQAlfOvxu8UXOteIo/DdjI7Wlm+JY1H+sn7/XaDge+a+i6+ZtTtpoPjRq6zplluZXBP8AdPzA/kRSk7JsqK5pJGJpnw38Q3kPmJBDEMcCR8Ma24/g7qrwCWe9iikIztwTivV9IMboNjoTjkBga0rmaOGFnlljjRRyzsABXN7WbR1ujBM+ddY0PWvB95b3aSMjQyh4bmFuVYdD7V9N+DPES+KvCdjq4CrLKm2dF6LKvDAe2efoa8p8Yz2Wu6RdW1hdwXEyoXVI2yTjniun+BMU0fgOdpPuPfSeWPYKoP61tSk5LUwrQUX7ux6biloorQxClopcUAJiinUUAFJS0UANoxS0lACV4t4utLHVfGuo3VmkheW3FrdCRdo3KQAVPXkYH4V7VXnfivSXs9c+1QxMYbpCdyqSEcYY59ORx9azq3tobUVFy1OAsPC+r25aVYbWzCLkSRht59QTn0rfvdHvdVisEkuSpa3DkHnL55GD3xW1LcKdHd3MkgAGVjXLVBa6o12bNTpV7Eo6O6gbT78+npXLzN6nYopGPb+HNTsmWa7uYHfhUeOBUKknHA6dPWuy+HCmz02XS47eOO3gZ3DKSSzlzu6np0qpeuJJoowzMSw6nNdT4b0yfTrB/tShbiVyWAOcAE45/WtaV3LQxrcqjZ7mzRRS10nGFLRRQAUUtFACUUtJQAhpMU6koASormAXVrLbt0lQp+dTU1mCKXPReaAPIJ5J4o5obaREkGdpcZFZtpLqvnKDq8jODyhthtx9c80uty3mk69ds8RaJpmcJ6BjkEexph8akxeRHZSF/TaAPzrhtZs9WMvdOo0uRZNXtI5W3bplX6nNemV494YivLnXbS7lGZBIHCDoijkmvYAQygjoRkV0UPhOLE/EhadikFLWxzhRRS0AFFFFABSUUUAFJTJJlj4PJ64FVmlkk74HoKdgLDyonU5PoKqXMrSRkcgHqPal20u3IwTTSEZWo6FZ6zbeTcphwMJIB8y/T29q81Fnoltr50o6xppuBL5WTOAN3off29eK9Wuo3mhe2idkZ12mRTgopHUH1r5v1vwZb6X8Q4fDH2//AES4mhHnNy0aydj7/wCIqJ0oz1ZrTrTgrI+irDSLfS4PKhXMh4dyOW/wHtWhDIyRgdQKz9KtZdPs4rCSV5khQJFM5yzKBjDH1Hr3rRwAMDpVpJKyM223dk6zKevFS1SxSh3T7p49KVhFyioo5RISOjDtUopDFooooASkJxyaWq185jspSOpG0fjxQBQjuDNdM5PU8D2q0Ky48CMEdeSp91P+FXjcIrEE4zyKsksUYpqkMoIPBp1AwxkgevFfKviHU5L/AMbatqRY7jfsyH0CNhf0UV9VZwQfQ18gXDbru5f+9K7fmxNAH16jb0D/AN4A/nTqitjm2i/3F/kKloAKQk5wKWoDOvnbAeR1oAa0xiuw3YHBrUrCdt4dvVv5mtm3bfbxsepUZpMES0UUVIxKp6gw8uJT/FIB/WrdZ2pPiW1X/bz/AEprcChFGzLNB/HG25fpioEudtwiP1K9fTtV2T93eLJ2I2t/SsrWY9s9tPHJtxKQ2B14PHt0qyTehfKipgc1kWN0HABbmtNXBGc0hjpm2wufRSf0r49kbIdvXJr68u3xZzn0jb+Rr4+Y5hb/AHT/ACoA+wrJt1jbn1iQ/wDjoqfNUdLfdpVk3rbxn/xwVaZ8cUAEj7RWb5yvclc/dG4/Sn3tyE+UdcVU02PfPO5LffG7PbgcUwL2wgxRn77Nvcelalof3GPRiP1rOiBacyHuOPpV2xbKSr6Of1qXsBcopKKkYlY2pSZux/sBf8aKKqO4mSSgORnoRisq+fE8SFQWPXj070UVQDbZAku7p7VqRH5MUUUMQ29J+wXJ9IX/APQTXyITmE/7v9KKKQ0fW2hvu0DTW9bSE/8Ajgq6TRRTEUZ4g8u7uKbaSM0s0YACq2Dx1oooGX4/vE06wfFxIvqM/kaKKT2A0ic0UUVAz//Z",
  },
  {
    name: "Coach Raisah",
    number: "0970 968 9164",
    facebook: "https://www.facebook.com/profile.php?id=61579641330542",
    fbName: "RM Raisah",
    photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAB4AHgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDQFPFMFOFecdxIOtPWoxTxSAkpGdURndgqqMlicAD1NIDXBfETWZFjTSYHIDqJJ8dx/Cv07n8KqMbuxLdkSav8SLeGZoNKt1uMHBmlJCH6DqfrxVOXx3rEdsJ0jtmT5dx8s/Ln8a5TQvDN/rchkjxHCDgyP3+nrXo1l4Bj/s2a3a6LPKm3JXhfwrZ+zjoZJVJaj9O8aRMYU1EJH5gyJUyFH1FdarB1DKQVIyCO9eNeJ9GvdC8q1nXdGv3ZlOVb/Cur+HWtyXNrJplyxZoRuhJ/u9x+FKpBW5ojhJ3tI7wUtNpawNQpKKCaQCGikJopgUBSg00UopjJAaeDUYpwNIQ/NeO3sp8QeK5UUnZPO24/3Y14/kK9Yv5xbafcz5/1cTv+QNeWeB7bzb+4mKBy0JAB9S3IrSGibJerSPQ9JGnW0aW8NxD8owEVxmujt2jUA7+PWuFj0/V7u4EctjZhRyJBlWTHQDjn6109no1xcaQy+biTdsxnipaVzZbDfENlpes2j2Mt3CHb7uXG5W7GvMvDssmi+K4YJ/lkguPIk/2g3Gf5V3dhp2vwTvALCwjhDcloyS698tiuR8eWa2fiUXqrsxFGeD/GCf6CrX8plJdT1MGlzUMMomhjlHR1DfmM1Jmshj800mikNIAzRSUUAZ4pwNMBpc1QyQGnZqLNLmgRl+Kp/I8Lak/T9wVH48f1rg/AFzHFc3G64jDgjZCQdzDuR7DArqfH9wIvCsyZ5lkRP1z/AEry/Tb06Xd216BuKPkr6r0I/KtoRvBmblyzTPdZPEEYtGiXPmEdB2FRWPicogt10+Vsv2PzYrnIjFqNss1rOyblykid/qKTT01ZZfs4v7kOTw0ZUAfX5c49qxsd0YqfVI7eHxC8Bmsp2G8H8x2rzX4lXdrcNamO8jNysrCW1C/MqlBtYn068e9dRqi22kg3dxLJKwTdK8jbicDt6V5BqN++q3lzfycPLKWx6DoB+AArSlG7uctaWlke4aDN52g6fIerW6fyrSzXPeDpvN8Kae3pHt/Imt8Gs3uCH5pKTNJmpAUmim5ooGUM0uajzS5qgJM0ZrK1nWoNFtVmnV3LnaqJ1JrjLzxxqdxkWyRWq+oG9vzPH6VcacpbESmo7ln4l3mYrGyB6lpW+nQf1rztyZCAOFFXtSury9uPNu55J3xgM5zgelU8YFdUIcqsc8pczPQfDbONDtJoDyilGX1wTXUQeIWt4SqWw3/SuR8JFxpK46Fm4/GurtLCS6lARCfU46Vxz+JndT1iiteQzX+i6rf3jZxbuqjsOK8oaB4SwGTG3f0r3DxPaPaeDb/C7V8naPxIryAYzW+GV0zlru0kejfDu583wwIz1hmdfzwf611wavG9J12/0WRltZQI2OWjYZVvrXX2Xj+3fC3to8R7vEdw/I81M6Mr3Q4VI2sztt1G6qFhqdnqURls51lUcNjgqfcdqt5rFqxsh+aKZmikMo5ozTc1WvrxLGxnupPuwoX+uOg/OqJZwHjPVTda4bVT+6tV2fVjy39B+FYW4HHvVWeV55XuHO6RmLP75OTT4mzEp9K7oLlVjjk7u5LKm5cA4PrUKRtn95tP0FSzcBW9DzQatknoPw+0wXunzjcAkU2D68jNem2trHaweVEoA7nua82+Fc2brUrbP3o0kA+hI/rXp4+U4NefWXvs7aUvcRynxEumt/CckJIzPIkY/PJ/lXjj7tvyYz716Z8U7oeXp1qD1ZpCP0rzQ11YdWgc9Z3kRgNn5myfpipAcUhOXx6UhOOa3MjovBuqLZa8IXbEdyPK+jfw/rx+Nem5rwiGZ0mWVDhkIYH3zkV7ZZXi31jBdJ92ZA/5jn9a468dbnTReli5mimZorA6EUd1ct46vRDoyWwb57iQcf7K8n9cV0jPXB+OiZL61AbJWEkL/wACrWmryRjUdonIMSuT68Glt5P3ZB7UjHdGW/Oq6OQ+PWuw5TUGJEIPQimISUGeo4NRRSY4Nb+ieGb7WJWlSKRLNT+8l2ZOfRR3P6UnJJXY1Ft2R0nwjuEj8cRwuAwuLeWMAjOSAGH/AKDXvZtbDq8cIPvx/WvnmW303Rbsf2cLn7UpP72WYZQYxjaMEH9aI7zz5CHV8d8SH+tJKM90cuIxDov3dfmavxbuUk8WJbwqojtrZRlBwSxJ7fhXAE9/Su08iBh0lwD0Mxwa5HUdo1K5VVCqJDhR0FXaxNDFe2bVtiuOBz1NRTvtQ09nAqlcy8haGzqHpwAO55Nen+Brvz9BMBOTbylfwPI/ma8wiOBuNdp8P7kx311bN/y1jDj6qf8AA1jWV4mtJ2kehZopmaK4zqMdpfevNPEV7Pca9ctIeIm8tB6KP85rvZZxGjSEjCgsc+1eZySG4leV/mZ2LEnpzXRRWtzGs9LFeWTk5ABI7dDVdOZKuGJSQGAI9BT8Kg4AH0rpOc6j4e6WLrWmuZolaOBflDgEbj3x7V6kXcXBVbuIL0AKkkV5v4OuI4rQmUNtLsTtPPt/KuvGsW8T5GnK4x95gTXDVbczvopKBx3jAGHxjGTLHI0kQJZFxnqOR61o2uk28rho9TtUQ4yJH+boM9Kw9dtnl16bU1sp4oXl2B9v7pWAGcHP+TUlsw39Qa66eyPEzD4rtHWPpdtEJS2rWpC5KhQSW44H1rzjUC7atdKFYuZW+UDJ6122mwrf38Vp5qRmRj8z9BgZrp9N/sPRHm8lllu5n3PK2Msx/p7U6lRR0Fl1ByvNKyPE3kwSDkEcEHtVWQgyKa9F8fQWNyYr5Y4xctKY5GX+MbeM+49a4drdWhMQ4G/dnv0xRCXMrnfOPK7FdHPYdK6Lwpe/ZPENoX5EpMTH03cD9cVz4tnT7vzfWrNpLcW88bhFYq6sF7kg8YpyV1YSdnc9rzRUcchkjVyjIWAJVuqk9jRXnnacL4juDFok+BnfhPoCa4jdtWiiuuj8JzVdxm9jk5oXJ5JoorYyLttrc+nxhIQNy9CelSz+KNTuE2rIsI7mNcE/jRRUckd7F88rWuT6T4w1XSIDbRyLLbMSWilUMDnrXRReNNIvkjj1LT4jt6ME8th+K9aKKHTT1GqjtZ6rzJH1Pw1JIr2zSBl52vL0+h4rMvvGUVuhh0uEKSMNL0/I0UVCppvUpz5Y2irGBNqTXiDzHJKnIXn86jWdQeTRRWqSWiMm29WSLKpJGfpVnT9TOnX8N0scchjYHEig/l6H3oopiPVNN1ltd0+K/aJIi25QqjspIGfU4Aooorhn8TO2Hwo//9k=",
  },
  {
    name: "Coach Jo Ann",
    number: "0951 685 1019",
    facebook: "https://www.facebook.com/profile.php?id=61590474596913",
    fbName: "Coach Jo Ann",
    photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAB4AHgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCmBmnquKFFSBa809IVVBxUirSqvepVUDk8Ad6ljSMbxBq40ewynNxJxGPT3rzO4lLbppmLFzkknrWr4gv21TWnYElAdkY9B/nn8ax47aTVtajsYeF3bR7Dua7aUVCN2ctSTnKyK8clzPKEt927oMVqQeFdRkG5kOetetaF4RtNOtUAhUtjliK0ZtOUKwAHHpWEsV/Kjohg9PeZ4jJp72cqrcq0a5/1gXdg+uKg1G+luJzv2MOAAgKj64716VremLMhXaK831Wwe2kZSOAeDWtKop7mVai6e2xseFtebTL1YJm/0aUgPn+E/wB7/PavTio6jv3rwqMnHXP9K9b8H6kdT0CMSHM1ufKf8On6VnXhb3kVQnf3WbBWo2X2qwVppWuc3KjDiipWX2oouBABUiikUVMoqiEORapa5cfZNHmYHDPiNfqeP5ZrSRa5jxxcmC2tIR1ZyQPfHH86ILmmkObtFs4dYz9oklA4XJH4nAq/4CtPP8SvLjOwkUw7FRlHPAB9zj/61XvAd1dWmq3LW2mveHJOFIH6mu2sm4NI5aLXOmz2qDiIAr2qO6iZlOBVDT/EbXJ8m40q4s3HHz4YfmKu6hetBbMUAY9ga8+1tGeonfVHN39u247ulcjrOmw3g25G71FaepQzXZebWNdFpB1EUJCVUsrHSHI+yXrSkHhi+TWkUo63Mpty0see3djLYXHlyAlT0NdN8N77ZrF5ZFgUlTev1FaHi7Sc6V56D54mBz7HiuV8JSiz8W2JwVLNsfJ65yK6XL2lNnE4OnVR7Ky4qMr3qdhUZHNcR1kLLRUjCigRUUVMq1GlToKpiRKi1wHja5Vtdt4yfltoix92Y/4CvQ14XJ7V43rd9/aOsXcwOVLYX3xwK1w6vO5nXdoFZbggNk8lyfyB/wAa0PCjaq2qRx2Ejxxu371oyAxXuATwDWHcfu/lzjaMH6mvUPhTYrJBLMyAkHAJ9a6K8uWJlhoc0y9oOi+IItZea/vWmt88Bmzx69OCfrxXTeIMGziRThjwa15f3IESYMjdyeBWD4higaxSRryNFJ++W4H4158m5O56cYqKsYVx4atNW05oLjeQ8plMgIDZPbOPu+3TgVJF4Ts9Pf7Qq5k2gA59K0NAuZEvptMnIlQIHjk74PY1dvhsyAabnK1rgqcb3tqctrqltHukbklMD615Xb3Hl+JVmznypEyfXBGa9P8AEd7BZac811uMKsu8KOTyOBXmGqahbapr11fWVmLS3kI2RA5xwBk+56n611Yde6zgxUveSPd2wQGHQ81GRmnWzebY28n96JT+gpSMVyG5A3FFPcUUwKajJqzGKgQc1YTimyUUPEl7/Z/h+7mBw5QomPU8f4mvIrVWjUyP98n5R6V6B4/v/s+nRQYzJKp+Udhkc/0rz8FoYd7ABiOCx6CuvDL3bnNiHrYq3DAZ3HIHNeifCDWgPtunSH5wRKn0PB/X+deXzyGQuBk55J9an0TVrjQ9Wg1C35aM/Mp6OvcGtasOeDRnRq+zmmfTcs8DCQzbdpX5tx4xXO3+saJFB5QEBRRtj2jofaks7vT/ABXpSXMeHjcfije49ay7nwl8xAhRx/eYV50UtpHu0lTkryZNZa1Zi5QW8sW4ngA4JrWurjzBk965+z8PQaZJ5pUNL/eI6fSrl1dCNMseg4HrSaV9DOTSehw3xH1BQltpyN8zHzZAOwHA/XP5Vw8HyYHfINbfi+Ga41qa6wWCRozewyRWAjHKn1r0aStTVjx60m6jbPoTR28zQ7J/+mK/yqwaoeGJPN8N2hznC7TWi4rznud/QhcUUNxRQIqoKsxrkioE60251K005Va4lCsfuoBlm+gFN67CRw/xGmnGqRW4IEMMPmDjkk9ef89K4N900TXEpOM4UE16R45u4bmCKSUwxOYyoUuGlIPqo+7+NeYz3G9FXsnArvofAceI+IZAR9pGehBz+VQnGGHp0p0Zwxb0FR55Jrc5zrPAOtXGk6yFVm+zz8OnYkf1r3Q6lG9uvbI7ivCNKsHh8NxakF5F3wf9nGD+pFevaBfLeadGSfmAwa87E6Tuj1MI/csyHUbsDJVWb0AFYMnnSSF5vwHYV2U9sknzED8qwbu3MjtgfKOtc6kdUlci0LQYNXi1CaePMUq/Z1JHXAyT+ZFcH4o8CXuhF7mEedZjkso5T6j0969v0+yGmabY2vRxF5j/AO83P+FNulhmys0IcHg844r0IXikeVUtKTOQ+H92LnQEj/iC5/EcH+n510kgxWp4Y0DQRELX7ILS6LuRNE20Mc4wR06YrSvvB14gLWsqTr6H5W/wrmlSldtbHRGrG1mck4oqze2NzZNtuYJIj/tLgfnRWRqU7FIJbqKK4dkjdgpdeoz9a8/8W6wkSmPT4zEsp3GXO+Vl9c9QPpjmu31i2eDws1+AcYkUt2G5SFP5j9a8q8Ryedr9wZMeTGFVcn2zx+ddlKns2ctSpukc6BlHkclYx0Pdz6VVIycgYHpVmctcz7F6dPoKilwrYQcjj6V1JHI3ciY7RtHXvUYp+Mcn8KWJC7AAck8UxHsenaQjfCtAFw/lHn0O7cf6VY8MLNa2wJO5W4+ldPpenbPAEMDDloMc+4rm/DUm+3MTdVNefiEenhmrHVrMGTAHJqtaWMt3qMNsFAV5Bu+nelVtn1rZ0X5VnvCOEG1fqawpx5pJHRVlywbDUpf+JrPg8BsCoFiMik+1S3sTSg3CjP8Af/xqSyRvmTYzErkYFd/U8sqIWUOykgrKxH51saf4lubceW5DKOgPasuJcpJnqJXz+dMaPJOKVir9zt4tcsruMRTorb+PLYZ3H6UVx1hby/aDIjHeqnafQnjNFNXZLsti9qWmwDwPe2VymYxaHd7HGdw+hr5gubnbJLLcszT9CSeeOMfpX1jrKG60iUKPvRsjD8P8mvj/AFBjJqU5b/noxP5mtY9jNvQmhjdl3cB36KOwqCZVjO3O41Z3i3hLPkyMMBR29KpPknLce1UQMwWOTXXeEPDkmpX8BKnazZzjsOp+nb86reFfCl14gvPlAjgjXeWcZyK9x8OaDbaRCBH88pA3SEcn/AVMpdC4x6m6sATRXjA4UYA+lea6P/o+qzwk9JGH616ssebGVcdRXlF0PsviS4GMZkz+YBrlrrQ7MM9WjqGUmuheP7FpsFr0cje/1NZehQC9vIQ3KL87/QVpXkhuLt37ZqKEdHIvEz1USSzkjTibPlMCrY54NWpJ7VIysMszcY4GwYHA96ziPlxURYomep7Cui5yWFmYM4woUIc8etIo3DNRE5IUc/1q0E/dgDqaaAu2Y2aZJKcZZtgoqSJ0SxgyCx2fKi9SSf8ADFFMRrThUVnz+5lAJP8AdPY18s+PdBk0TxfeIEAjkmZkx05OR+HIooqupPQxZSqJvPLL0J/nUWl2T6lqcUCjJY0UVb2J6n0L4Y0SLTLGG3VcMF2k9zn/AOvW7artk2++KKKxNDbtoiYnX1FeR+LY/sniDceNwH6EiiiorL3TWg/fO48IRNH4be9YfNcMUQ/7I/8Ar/yq2IiOSKKKqKSiiZtuTbI2XnpVWRi5yOnQf40UULcTEjT5xmrjnZC0mM7QSBRRVEl+1JjsVMZVp2Xlh0QfXsPaiiimLqf/2Q==",
  },
  {
    name: "Coach Mike",
    number: "0951 598 6840",
    facebook: "https://www.facebook.com/profile.php?id=61576324811239",
    fbName: "Easebrew Mike",
    photo: "data:image/jpeg;base64,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",
  },
];
// ============================================================

const PRODUCTS = [
  {
    id: 1,
    icon: "📊",
    name: "Body Pain Tracker + Journal",
    desc: "I-track ang iyong pain levels, tulog, mood, at Easebrew intake araw-araw.",
    value: "₱149",
    tier: 999,
    tierLabel: "₱999+ order",
    isApp: true,
    appUrl: "/tracker",
  },
  {
    id: 2,
    icon: "🥗",
    name: "50-Day Anti-Inflammation Meal Plan",
    desc: "50 days ng Pinoy-friendly na pagkain para sa rayuma, joint pain, at pagod.",
    value: "₱199",
    tier: 1499,
    tierLabel: "₱1,499+ order",
    isApp: true,
    appUrl: "/meal-plan",
  },
  {
    id: 3,
    icon: "💪",
    name: "30-Day Home Exercise Guide",
    desc: "Low-impact exercises para sa may joint pain. Walang gym equipment needed.",
    value: "₱199",
    tier: 1499,
    tierLabel: "₱1,499+ order",
    isApp: true,
    appUrl: "/exercise",
  },
  {
    id: 4,
    icon: "📖",
    name: "Pinoy Anti-Inflammation Recipe Book",
    desc: "30 healthy Pinoy recipes na anti-inflammatory.",
    value: "₱249",
    tier: 2998,
    tierLabel: "₱2,998+ order",
    isApp: true,
    appUrl: "/recipes",
  },
];

const WELLNESS_TIPS = [
  "Inumin ang Easebrew 30 mins bago kumain para sa best effect.",
  "Uminom ng 8 glasses ng tubig araw-araw — ang dehydration ay nagpapalala ng joint pain.",
  "I-massage ang Avocado Miracle Oil sa affected joints bago matulog gabi-gabi.",
  "Maglakad ng 15 mins pagkatapos kumain para sa mas magandang digestion.",
  "Kumain ng isda (salmon o bangus) tatlong beses sa isang linggo para sa omega-3.",
  "Ang turmeric at luya ay natural anti-inflammatory — dagdag sa ulam araw-araw.",
  "Matulog ng 7-8 hours — dito nagri-repair ang joints at muscles ng katawan.",
  "Ang malunggay ay superfood — dagdag sa sinigang, tinola, o lugaw.",
];

const RECIPES = [
  {
    name: "Sinigang na Salmon",
    benefit: "Omega-3 Anti-Inflammation",
    ingredients: "Salmon, kamatis, kangkong, labanos, sampalok",
    icon: "🐟",
  },
  {
    name: "Tinolang Manok with Malunggay",
    benefit: "Immune Boost + Joint Support",
    ingredients: "Manok, malunggay, sayote, luya, bawang",
    icon: "🍗",
  },
  {
    name: "Ginger-Turmeric Lugaw",
    benefit: "Powerful Anti-Inflammation",
    ingredients: "Bigas, luya, turmeric, bawang, sibuyas",
    icon: "🍚",
  },
];

const FAQS = [
  {
    q: "Kailan ko dapat inumin ang Easebrew?",
    a: "Best sa umaga (7-9AM), 30 mins bago kumain. Para sa mas mataas na benepisyo, pwede ring uminom ng pangalawang baso sa hapon (3-5PM).",
  },
  {
    q: "Pwede ba ang may ulcer?",
    a: "Oo, pero uminom pagkatapos kumain ng konti. Huwag inumin nang empty stomach.",
  },
  {
    q: "Kailan ko mararamdaman ang effect?",
    a: "Karamihan sa mga customers ay nakakaramdam ng change sa loob ng 7-14 days ng consistent na pag-inom. Para sa mas malalim na effect — 30-90 days.",
  },
  {
    q: "Paano gamitin ang Avocado Miracle Oil?",
    a: "I-massage ng 5-10 mins bawat gabi sa masakit na parte. Best pagkatapos ng mainit na shower — mas bukas ang pores, mas mabilis masipsip.",
  },
  {
    q: "Ilang sachet bawat araw?",
    a: "1 sachet araw-araw para sa maintenance. Para sa mas matinding joint pain, pwedeng 2 sachets — umaga at hapon.",
  },
  {
    q: "Paano ko ma-access ang aking libreng digital products?",
    a: "I-tap ang button sa bawat product card. Para sa Body Pain Tracker, Meal Plan, Exercise Guide, at Recipe Book — may interactive app na direkta sa iyong phone!",
  },
  {
    q: "May side effects ba ang Easebrew?",
    a: "Ang Easebrew ay gawa sa natural na herbs. Walang known side effects para sa karamihan. Kung may allergy o maintenance medicine — kumonsulta muna sa doktor.",
  },
  {
    q: "COD ba at free shipping?",
    a: "Oo! COD available sa buong Pilipinas. Free shipping sa qualifying orders.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nena R.",
    age: 58,
    location: "Quezon City",
    quote: "Pagkatapos ng 3 weeks, mas gaan na ang pakiramdam ng aking tuhod. Hindi ko na kailangang uminom ng gamot araw-araw.",
    stars: 5,
    painBefore: 8,
    painAfter: 3,
  },
  {
    name: "Mang Tony",
    age: 64,
    location: "Cebu City",
    quote: "Hindi ako naniniwala noong una pero subukan ko nga. Ngayon — hindi ko na naiisip ang umaga nang walang Easebrew.",
    stars: 5,
    painBefore: 7,
    painAfter: 2,
  },
  {
    name: "Ate Susan",
    age: 52,
    location: "Davao",
    quote: "Ang libreng meal plan at recipe book — sobrang helpful! Alam ko na ngayon kung anong pagkain ang nagpapalala ng arthritis ko.",
    stars: 5,
    painBefore: 6,
    painAfter: 3,
  },
];

const REMINDERS = [
  { time: "Morning", icon: "☕", text: "Inumin ang Easebrew 30 mins bago kumain", bg: "#E8F5E0", border: "#39613B", textColor: "#39613B" },
  { time: "Lunch", icon: "🚶", text: "Maglakad ng 15 mins pagkatapos kumain", bg: "#FEF9E7", border: "#C0863B", textColor: "#C0863B" },
  { time: "Afternoon", icon: "💧", text: "Uminom ng 8 glasses ng tubig ngayon", bg: "#FFFBF0", border: "#FED255", textColor: "#8B6914" },
  { time: "Night", icon: "🌿", text: "I-massage ang Avocado Oil sa masakit na parte", bg: "#F4F8F0", border: "#7DAE2F", textColor: "#39613B" },
];

const PROGRESS_GUIDE = [
  { period: "Week 1–2", title: "Simula ng Pagbabago", desc: "Mararamdaman mo ang unang effect — mas gaan ang pakiramdam sa umaga, mas okay ang energy.", bg: "#E8F5E0", border: "#39613B", color: "#39613B" },
  { period: "Week 3–4", title: "Makikita na ang Change", desc: "Ang mga taong malapit sa iyo ay mag-no-notice. Mas magaan na ang galaw, mas baba na ang pain score.", bg: "#FEF9E7", border: "#C0863B", color: "#C0863B" },
  { period: "Month 2", title: "Tuloy-tuloy na Progress", desc: "Ang anti-inflammation routine ay nagiging natural na habit. Hindi mo na kailangan ng reminder.", bg: "#FFFBF0", border: "#FED255", color: "#8B6914" },
  { period: "Month 3", title: "Bagong Katawan, Bagong Buhay", desc: "50%+ reduction ng pain score. Mas aktibo, mas masaya, mas malusog. Ito ang Bagong Katawan.", bg: "#F4F8F0", border: "#7DAE2F", color: "#39613B" },
];

const G = "#39613B";
const GOLD = "#FED255";
const AMBER = "#C0863B";
const CREAM = "#EEE5D4";
const DARK = "#1B201A";
const MID = "#4E504F";

const APP_LABELS: Record<number, string> = {
  1: "📊 Open ang Tracker",
  2: "🥗 Open ang Meal Plan",
  3: "💪 Open ang Exercises",
  4: "📖 Open ang Recipe Book",
};

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[...Array(count)].map((_, i) => (
        <span key={i} style={{ color: "#FED255", fontSize: 20 }}>★</span>
      ))}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ borderBottom: "1px solid #D9D0C0", padding: "20px 0", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#1B201A", margin: 0, lineHeight: 1.4 }}>{q}</p>
        <span style={{ fontSize: 26, color: "#39613B", flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>
      {open && (
        <p style={{ fontSize: 17, color: "#4E504F", marginTop: 12, lineHeight: 1.7, margin: "12px 0 0 0" }}>{a}</p>
      )}
    </div>
  );
}

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const isPlaceholder = videoId.startsWith("YOUR_VIDEO_ID");
  if (isPlaceholder) {
    return (
      <div style={{
        background: "#1B201A", borderRadius: 18, aspectRatio: "16/9",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${G}`,
      }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 60, marginBottom: 10, color: GOLD }}>▶</div>
          <p style={{ fontSize: 13, opacity: 0.55, margin: 0 }}>
            I-update ang VIDEOS config sa itaas ng file
          </p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ borderRadius: 18, overflow: "hidden", aspectRatio: "16/9", border: `2px solid ${G}` }}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ display: "block", border: "none" }}
      />
    </div>
  );
}

function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    const wasDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);

    if (isIOS && isSafari) {
      setTimeout(() => setShowIOS(true), 2000);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { setInstalled(true); setShowAndroid(false); }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowAndroid(false);
    setShowIOS(false);
    setDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (installed || dismissed) return null;

  if (showAndroid) {
    return (
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, zIndex: 9999,
        background: G, padding: "20px 24px",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
        borderTop: `4px solid ${GOLD}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 40, flexShrink: 0 }}>📲</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
              I-install ang R&M EaseBrew App!
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              I-save sa iyong phone — madaling buksan anytime!
            </p>
          </div>
          <button onClick={handleDismiss} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 24, cursor: "pointer", padding: "4px", flexShrink: 0 }}>✕</button>
        </div>
        <button onClick={handleAndroidInstall} style={{
          marginTop: 14, width: "100%", background: GOLD, color: G,
          border: "none", borderRadius: 14, padding: "16px",
          fontSize: 18, fontWeight: 700, cursor: "pointer",
        }}>
          ✅ Yes! I-install sa Aking Phone →
        </button>
      </div>
    );
  }

  if (showIOS) {
    return (
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 680, zIndex: 9999,
        background: "#FFFFFB", padding: "24px 24px 32px",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
        borderTop: `4px solid ${GOLD}`,
        borderRadius: "20px 20px 0 0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>📱</span>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>I-save sa iyong iPhone!</p>
              <p style={{ fontSize: 13, color: MID, margin: 0 }}>Para madaling buksan anytime</p>
            </div>
          </div>
          <button onClick={handleDismiss} style={{ background: "#f0f0f0", border: "none", borderRadius: 999, width: 32, height: 32, fontSize: 18, cursor: "pointer", color: MID, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {[
            { step: "1", icon: "🌐", label: "Open sa", highlight: "Safari" },
            { step: "2", icon: "⬆️", label: "I-tap ang", highlight: "Share button (⬆️) sa ibaba ng screen" },
            { step: "3", icon: "➕", label: "Piliin ang", highlight: '"Add to Home Screen"' },
            { step: "4", icon: "✅", label: "I-tap ang", highlight: '"Add" — done na!' },
          ].map((s) => (
            <div key={s.step} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#F4FAF0", borderRadius: 12, padding: "12px 14px",
              border: "1.5px solid #C5D9BC",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: G, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{s.step}</div>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
              <p style={{ fontSize: 15, margin: 0, color: DARK, lineHeight: 1.4 }}>
                {s.label} <strong style={{ color: G }}>{s.highlight}</strong>
              </p>
            </div>
          ))}
        </div>
        <div style={{ background: "#FEF9E7", borderRadius: 10, padding: "10px 14px", border: `1px solid ${GOLD}` }}>
          <p style={{ fontSize: 13, color: AMBER, margin: 0, textAlign: "center", fontWeight: 600 }}>
            ⚠️ Use Safari — hindi Chrome ang gagamitin sa iPhone
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function Home() {
  const [selectedTier, setSelectedTier] = useState(1499);
  const [tipIndex, setTipIndex] = useState(0);

  const unlockedProducts = PRODUCTS.filter((p) => p.tier <= selectedTier);
  const lockedProducts = PRODUCTS.filter((p) => p.tier > selectedTier);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", background: CREAM, minHeight: "100vh", padding: "0 0 80px 0" }}>

      <InstallBanner />

      {/* HERO */}
      <div style={{ background: G, padding: "52px 24px 44px", textAlign: "center", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(125,174,47,0.15)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, background: "rgba(254,210,85,0.1)", borderRadius: "50%" }} />
        <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 20, padding: "6px 18px", fontSize: 13, fontWeight: 700, marginBottom: 20, letterSpacing: 1 }}>
          ☕ EVERYDAY WE CARE
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.25, color: "#fff" }}>
          Kamusta, Nanay at Tatay! 👋
        </h1>
        <p style={{ fontSize: 19, opacity: 0.9, lineHeight: 1.65, margin: "0 0 24px 0" }}>
          Salamat sa inyong tiwala sa EaseBrew. Nandito na ang lahat ng kailangan ninyo para sa mas malusog na katawan.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 22px", fontSize: 16, border: "1.5px solid rgba(255,255,255,0.3)" }}>
          🌿 R&M EaseBrew Wellness Hub
        </div>
      </div>

      {/* DAILY REMINDERS */}
      <div style={{ padding: "44px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Your Daily Routine</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>
          Sundin ito every day para sa pinakamabilis na results.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {REMINDERS.map((r, i) => (
            <div key={i} style={{ background: r.bg, border: `2px solid ${r.border}`, borderRadius: 18, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: 38, flexShrink: 0 }}>{r.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: r.textColor, margin: "0 0 5px 0", textTransform: "uppercase", letterSpacing: 1.2 }}>{r.time}</p>
                <p style={{ fontSize: 18, color: DARK, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FREE GIFTS */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Your Free Gifts 🎁</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 20, lineHeight: 1.65 }}>
          Piliin ang halaga ng inyong order para makita ang mga unlocked na products.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {[999, 1499, 2998].map((t) => (
            <button key={t} onClick={() => setSelectedTier(t)} style={{
              padding: "13px 20px", borderRadius: 12,
              border: selectedTier === t ? `2.5px solid ${G}` : "2px solid #C5B99A",
              background: selectedTier === t ? G : "#FFFFFB",
              color: selectedTier === t ? "#fff" : MID,
              fontSize: 16, fontWeight: selectedTier === t ? 700 : 500, cursor: "pointer",
            }}>
              ₱{t.toLocaleString()}+
            </button>
          ))}
        </div>

        {unlockedProducts.map((p) => (
          <div key={p.id} style={{ background: "#FFFFFB", border: `2.5px solid ${G}`, borderRadius: 18, padding: "24px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 42 }}>{p.icon}</span>
              <span style={{ background: "#E8F5E0", color: G, borderRadius: 8, padding: "5px 13px", fontSize: 14, fontWeight: 700 }}>Value: {p.value}</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: G, margin: "0 0 8px 0" }}>{p.name}</h3>
            <p style={{ fontSize: 17, color: MID, margin: "0 0 20px 0", lineHeight: 1.65 }}>{p.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, color: G, fontWeight: 600 }}>✅ Unlocked na!</span>
              <Link href={p.appUrl} style={{ background: G, color: "#fff", borderRadius: 12, padding: "14px 26px", fontSize: 17, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                {APP_LABELS[p.id]}
              </Link>
            </div>
          </div>
        ))}

        {lockedProducts.length > 0 && (
          <>
            <p style={{ fontSize: 15, color: MID, margin: "24px 0 12px 0", fontWeight: 600 }}>🔒 Ma-u-unlock sa mas malaking order:</p>
            {lockedProducts.map((p) => (
              <div key={p.id} style={{ background: "#F5F0E8", border: "2px solid #C5B99A", borderRadius: 18, padding: "24px", marginBottom: 16, opacity: 0.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 42, filter: "grayscale(1)" }}>{p.icon}</span>
                  <span style={{ background: "#E8E0D0", color: "#8A7D6A", borderRadius: 8, padding: "5px 13px", fontSize: 14, fontWeight: 700 }}>🔒 {p.tierLabel}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#8A7D6A", margin: "0 0 8px 0" }}>{p.name}</h3>
                <p style={{ fontSize: 17, color: "#A89880", margin: "0 0 20px 0", lineHeight: 1.65 }}>{p.desc}</p>
                <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "#FFFFFB", color: G, border: `2px solid ${G}`, borderRadius: 12, padding: "14px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", textAlign: "center", textDecoration: "none", boxSizing: "border-box" as const }}>
                  Mag-order pa para ma-unlock ito →
                </a>
              </div>
            ))}
          </>
        )}
      </div>

      {/* WELLNESS VIDEOS */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Videos para sa Inyo 🎬</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>
          Panoorin ito para malaman kung paano gamitin ang inyong products nang tama.
        </p>
        {VIDEOS.map((v, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <YouTubeEmbed videoId={v.id} title={v.title} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: "14px 0 6px 0" }}>{v.title}</h3>
            <p style={{ fontSize: 17, color: MID, margin: 0, lineHeight: 1.65 }}>{v.desc}</p>
          </div>
        ))}
      </div>

      {/* RECIPE PREVIEW */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Recipe Preview 🍲</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>
          3 recipes mula sa aming libreng Recipe Book.
        </p>
        {RECIPES.map((r, i) => (
          <div key={i} style={{ background: "#FFFFFB", border: "1.5px solid #C5B99A", borderRadius: 18, padding: "20px 24px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <span style={{ fontSize: 36 }}>{r.icon}</span>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: "0 0 4px 0" }}>{r.name}</h3>
                <span style={{ fontSize: 13, background: "#E8F5E0", color: G, borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>{r.benefit}</span>
              </div>
            </div>
            <p style={{ fontSize: 16, color: MID, margin: 0, lineHeight: 1.6 }}><strong>Ingredients:</strong> {r.ingredients}</p>
          </div>
        ))}
        <div style={{ background: G, borderRadius: 18, padding: "24px", textAlign: "center" }}>
          <p style={{ fontSize: 17, color: GOLD, fontWeight: 700, margin: "0 0 14px 0" }}>📖 May 27 pang recipes sa buong Recipe Book!</p>
          <Link href="/recipes" style={{ background: GOLD, color: G, borderRadius: 12, padding: "16px 28px", fontSize: 17, fontWeight: 700, textDecoration: "none", display: "inline-block", width: "100%", boxSizing: "border-box" as const }}>
            📖 Open ang Buong Recipe Book →
          </Link>
        </div>
      </div>

      {/* 90-DAY JOURNEY */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Your 90-Day Journey 📅</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>
          Ito ang mararamdaman ninyo sa bawat phase ng wellness journey.
        </p>
        {PROGRESS_GUIDE.map((p, i) => (
          <div key={i} style={{ background: p.bg, border: `2px solid ${p.border}`, borderRadius: 18, padding: "24px", marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: p.color, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: 1.2 }}>{p.period}</p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: "0 0 8px 0" }}>{p.title}</h3>
            <p style={{ fontSize: 17, color: MID, margin: 0, lineHeight: 1.7 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* UPSELL — 90-DAY PROGRAM */}
      <div style={{ padding: "48px 24px 0" }}>
        <div style={{ background: G, borderRadius: 22, padding: "40px 24px", color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "rgba(254,210,85,0.12)", borderRadius: "50%" }} />
          <div style={{ display: "inline-block", background: GOLD, color: G, borderRadius: 20, padding: "6px 18px", fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>✨ SPECIAL OFFER</div>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🏆</div>
          <h2 style={{ fontSize: 27, fontWeight: 700, margin: "0 0 14px 0", lineHeight: 1.3 }}>Bagong Katawan sa 90 Days Program</h2>
          <p style={{ fontSize: 17, opacity: 0.9, margin: "0 0 24px 0", lineHeight: 1.7 }}>
            Ang pinaka-complete na wellness program. 90-day master plan, full exercise program, weekly check-in guide, at lahat ng digital products — lahat kasama!
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, textAlign: "left" }}>
            {[
              "✅ 90-Day Master Plan na may daily schedule",
              "✅ 3 Phases ng progressive wellness program",
              "✅ Full exercise library para sa joint pain",
              "✅ Weekly milestone check-ins",
              "✅ Lahat ng digital products kasama na",
            ].map((item, i) => (
              <p key={i} style={{ fontSize: 17, margin: 0 }}>{item}</p>
            ))}
          </div>
          <div style={{ marginBottom: 22 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: GOLD }}>₱499</span>
            <span style={{ fontSize: 16, opacity: 0.8, marginLeft: 10 }}>one-time payment lang</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/bagong-katawan" style={{ background: GOLD, color: G, border: "none", borderRadius: 14, padding: "20px 32px", fontSize: 20, fontWeight: 700, cursor: "pointer", width: "100%", textAlign: "center", textDecoration: "none", display: "block", boxSizing: "border-box" as const }}>
              🏆 I-start ang 90-Day Program →
            </Link>
            <a href={BAGONG_KATAWAN_ORDER_URL} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 14, padding: "14px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", textAlign: "center", textDecoration: "none", display: "block", boxSizing: "border-box" as const }}>
              🛒 Mag-order ng 90-Day Program
            </a>
          </div>
          <p style={{ fontSize: 14, opacity: 0.7, margin: "16px 0 0 0" }}>COD available • Free shipping • Nationwide</p>
        </div>
      </div>

      {/* ✅ NEW: AGENT DIRECTORY */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Makipag-ugnayan sa Aming Coaches 👥</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>
          May katanungan? Handa kaming tumulong sa inyo! Makipag-usap sa aming mga wellness coach.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {AGENTS.map((agent, i) => (
            <div key={i} style={{
              background: "#FFFFFB",
              border: `2px solid #C5B99A`,
              borderRadius: 18,
              padding: "20px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <img
                  src={agent.photo}
                  alt={agent.name}
                  style={{
                    width: 56, height: 56, borderRadius: 16,
                    objectFit: "cover", border: `2.5px solid ${G}`,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: DARK, margin: 0 }}>{agent.name}</h3>
                  <p style={{ fontSize: 14, color: G, margin: "3px 0 0 0", fontWeight: 600 }}>R&M EaseBrew Wellness Coach</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {/* Call button */}
                <a
                  href={`tel:${agent.number.replace(/\s/g, "")}`}
                  style={{
                    flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: G, color: "#fff",
                    borderRadius: 12, padding: "13px 10px",
                    fontSize: 15, fontWeight: 700, textDecoration: "none",
                    textAlign: "center" as const,
                  }}
                >
                  📞 {agent.number}
                </a>
                {/* Facebook button */}
                <a
                  href={agent.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#1877F2", color: "#fff",
                    borderRadius: 12, padding: "13px 10px",
                    fontSize: 15, fontWeight: 700, textDecoration: "none",
                    textAlign: "center" as const,
                  }}
                >
                  📘 Facebook
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Sinasabi ng mga Customers 💬</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 24, lineHeight: 1.65 }}>Real stories mula sa mga katulad ninyo.</p>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} style={{ background: "#FFFFFB", border: "1.5px solid #C5B99A", borderRadius: 18, padding: "24px", marginBottom: 16 }}>
            <StarRating count={t.stars} />
            <p style={{ fontSize: 18, color: DARK, margin: "14px 0 18px 0", lineHeight: 1.75, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>{t.name}, {t.age}</p>
                <p style={{ fontSize: 15, color: MID, margin: 0 }}>{t.location}</p>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <p style={{ fontSize: 13, color: MID, margin: "0 0 2px 0" }}>Pain Score</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: G, margin: 0 }}>{t.painBefore} → {t.painAfter} ✅</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WELLNESS TIP */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 24 }}>Tip of the Day 💡</h2>
        <div style={{ background: "#FFFFFB", borderLeft: `6px solid ${AMBER}`, borderRadius: 14, padding: "24px", marginBottom: 16 }}>
          <p style={{ fontSize: 19, color: DARK, margin: 0, lineHeight: 1.75 }}>🌿 {WELLNESS_TIPS[tipIndex]}</p>
        </div>
        <button onClick={() => setTipIndex((i) => (i + 1) % WELLNESS_TIPS.length)} style={{ background: "#FFFFFB", border: `2px solid ${G}`, borderRadius: 12, padding: "15px 24px", fontSize: 17, fontWeight: 600, color: G, cursor: "pointer", width: "100%" }}>
          Next Tip →
        </button>
      </div>

      {/* FAQ */}
      <div style={{ padding: "48px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: G, marginBottom: 8 }}>Common Questions ❓</h2>
        <p style={{ fontSize: 17, color: MID, marginBottom: 8, lineHeight: 1.65 }}>I-tap ang tanong para makita ang sagot.</p>
        <div style={{ background: "#FFFFFB", border: "1.5px solid #C5B99A", borderRadius: 18, padding: "8px 24px" }}>
          {FAQS.map((faq, i) => (<FAQItem key={i} q={faq.q} a={faq.a} />))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "48px 24px 0", textAlign: "center", borderTop: `3px solid ${G}`, marginTop: 52 }}>
        <div style={{ display: "inline-block", background: G, color: GOLD, borderRadius: 16, padding: "10px 24px", fontSize: 20, fontWeight: 700, marginBottom: 16, letterSpacing: 0.5 }}>
          R&M EaseBrew
        </div>
        <p style={{ fontSize: 14, color: G, fontWeight: 700, margin: "0 0 6px 0", letterSpacing: 1, textTransform: "uppercase" }}>Everyday We Care</p>
        <p style={{ fontSize: 17, color: MID, margin: "0 0 24px 0", lineHeight: 1.65 }}>
          Para sa mga Pilipinong naghahanap ng natural na lunas sa body pain at inflammation.
        </p>
        <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" style={{ background: GOLD, color: G, borderRadius: 12, padding: "18px 32px", fontSize: 18, fontWeight: 700, textDecoration: "none", width: "100%", maxWidth: 340, display: "block", textAlign: "center", boxSizing: "border-box" as const, margin: "0 auto" }}>
          🛒 Mag-order Ulit
        </a>
        <p style={{ fontSize: 14, color: MID, marginTop: 32, lineHeight: 1.7 }}>
          COD | Free Shipping | Nationwide Delivery<br />
          © 2025 EaseBrew Herbal Coffee. All rights reserved.
        </p>
      </div>

    </div>
  );
}