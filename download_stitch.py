import urllib.request
import os
import json

SCREENS = [
    {
        "name": "Advanced Analytics",
        "screenshot": "https://lh3.googleusercontent.com/aida/ADBb0ujYRazseOzsbN-WklUdKh-4etSTK1Ym63clzABx6d_KQQfFdLa4J0NeQbaGyw0RXeK-NWOOwRGJ1w6vCMQBOQnBMQJ7RXhjXTEDaQG21D3I62w7jp5VJ9RMuIbcu3EjEeDOZaRr4iapfZj16SV-nTgzdI15SMoRQy9SbKL2BOM-N-q2zm3y0-cJWBcof34btxyTQRrrxUGsT7w6narTJC1YIMqurwIO63eNyVYsV39fXz0iLR1ouGgKBHVt",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2ZjYTk5MTVlMDU4ZDQ2OTM4NGFlNmYwNTc1MmEzY2FiEgsSBxCqvqXYwRIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzM0OTc2OTM4MTg0NDQ0NTgxOQ&filename=&opi=89354086"
    },
    {
        "name": "Executive Dashboard",
        "screenshot": "https://lh3.googleusercontent.com/aida/ADBb0uhjmhTmIFtd5N2RswfZZfGo-zq6lhJtOq6Rg8LmYeDrxgzkBOolvBAS1DzIgIzkVGgXSVkJvqnFNeAPnzgcGFggvU56J0Tvh3sntbUKs4DvMGVTmJg1g4QHJvqCqoBFytcGhErKYHbaDb3j3XFeuX4VUiCMZGOD3Qr74aysO0j9byDVl2WQhcIZOJGTmRC5RysWry4kpEjPTVX8mKHwK7JYgaE3-CNxTjGhFOx5upsL8SenBpmj8NO4mFlg",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQ2ZWFjMGRjYzc1ZDRhYTBiY2ZkYjU1NzY3MTcwYjdmEgsSBxCqvqXYwRIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzM0OTc2OTM4MTg0NDQ0NTgxOQ&filename=&opi=89354086"
    },
    {
        "name": "Customer Relationship Hub",
        "screenshot": "https://lh3.googleusercontent.com/aida/ADBb0ugGhJs6lwLNY-b17ICzGGEk4npDcEWGjR_DBMOLBo-TKVZnjm-iQKqX97K3ex8gB9lzkXEhnx9a6j92-3gUcsd_aXlEP3iBkBHb2k3TPLxhSe6VuNL4lfRAMx8eiSGIdxDhFM_qqSzTJkp4sEtLyXLc-MYlrnqLU4X8yMx35k_AcVP_-FKb5cp15g3logCAz8bveiLn6uuhxdvwME3kKYLRc6pHHB8mIh81HjAltZyehBYnYZle8wyzlO4",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E3YWYzZWFkOTZmOTRlZDFiNzAyYzc2OTE4ZmU5NzA2EgsSBxCqvqXYwRIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzM0OTc2OTM4MTg0NDQ0NTgxOQ&filename=&opi=89354086"
    },
    {
        "name": "Data Management",
        "screenshot": "https://lh3.googleusercontent.com/aida/ADBb0uhsOoWS9_mnZ0CF_gQfl7eIRIQadiD4afDRje-rkAkICc96uJ4C7Wfy2D7o2DXF06Z9jwSUm5xj3EzJpVhVwgCu_fHaHrR7FX4DmIjXlFzmBzgBLwmujDM7D0fULhiPWf-RFgZb0VM_GpCClfOp85nHBMEvcFBGGE6ngS7RCBGH-ICPzpJD6fGkLBLOHiY66bxCXCSIoWzmwh1Ta5AoxtTWHMDv_CJ8Wm7n5yWqbG2pf8yhI3p9fJ2E54Nj",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzZlZDY3NTkyYmFjNzQzMjNiYjIxODY3YjE1YzU4YWM1EgsSBxCqvqXYwRIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzM0OTc2OTM4MTg0NDQ0NTgxOQ&filename=&opi=89354086"
    },
    {
        "name": "Login",
        "screenshot": "https://lh3.googleusercontent.com/aida/ADBb0uiaWuJI18Vs6O9G8_3H_iUO1g9WWcUKX6WkDNopDCqOVV1W2xxEjooA2gZGPeI7jGLM8doI65FWYPLJRp6hGoITv_Zq6coX89mIuAeYS8l9OS_r9cWIzsS7id_hxoAd7aVz4iPOhRJJMNS4m9sJ0wphq8UXWLYFkeVoOGxjtp2tXwrXUlrHyKZTErGTW_iqkgf_A59W7EdV2W8d2FiZNfbM2CCq90UVME_N0gGp9ZZdlp_TZg6S7NekvrDc",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzA2MmVkYzI5OWMzMzQwYmE4MTM0YzcxNjBiNDUxNDY3EgsSBxCqvqXYwRIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzM0OTc2OTM4MTg0NDQ0NTgxOQ&filename=&opi=89354086"
    },
    {
        "name": "Register",
        "screenshot": "https://lh3.googleusercontent.com/aida/ADBb0ugtwGo_jk9XS6NaHQC6_Iv9k5mNiypJieNF5tYznkaTIzf0x3aLe5XMdXD1ZGtux5MJM6ry4sPo-Nn67pZ32oJi_CQLZLfoUTLGIzs4zsW8gVenKsraAIezWTqXtvfAVIROX0i2Bfe9BKLfFZZhUg7LCB7y6QNonBa3AjvG4ZLY7yjd8kN44WWm61aN6txK54Iein9qPzbKuEy5tjlc-9Hs6zKacAlg-nKHkXv4tb6CjBY02sV47wmdDyhU",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2U1NmFmMDBkOWU1NjRiMjdiNzA1Yjc2NzdmNTQyZjY2EgsSBxCqvqXYwRIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzM0OTc2OTM4MTg0NDQ0NTgxOQ&filename=&opi=89354086"
    }
]

def download():
    out_dir = r"c:\Users\sahaj\OneDrive\Desktop\Revenue Operations Analytics Platform\stitch_assets"
    os.makedirs(out_dir, exist_ok=True)
    
    for s in SCREENS:
        name = s['name'].replace(' ', '_').lower()
        print(f"Downloading {name}...")
        urllib.request.urlretrieve(s['html'], os.path.join(out_dir, f"{name}.html"))
        urllib.request.urlretrieve(s['screenshot'], os.path.join(out_dir, f"{name}.png"))

if __name__ == '__main__':
    download()
