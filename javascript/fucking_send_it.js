function stwp_send_to_webhook(username, url) {
    stwp_just_fucking_send_it(username, url).then(console.log("Sent!")).catch(console.warn);
}

function stwp_get_prompts() {
    const gr = gradioApp();

    /** @type {HTMLTextAreaElement} */
    const prompt = gr.querySelector("#txt2img_prompt > label > textarea");
    /** @type {HTMLTextAreaElement} */
    const negativePrompt = gr.querySelector("#txt2img_neg_prompt > label > textarea")

    return {
        prompt: prompt.value,
        negativePrompt: negativePrompt.value
    }
}

async function stwp_just_fucking_send_it(username, url) {
    const imageData = await stwp_steal_image_from_gallery();
    const imageFile = stwp_make_it_quack(imageData);
    const image = await imageFile.arrayBuffer();

    const prompts = stwp_get_prompts();

    const formData = new FormData();
    formData.append("payload_json", JSON.stringify({
        content: `A new image just dropped\nPrompt:\`\`\`${prompts.prompt}\`\`\`\nNegative:\`\`\`${prompts.negativePrompt}\`\`\``,
        username: username,
        file: "image.png",
    }));
    formData.append("file", new Blob([image], { type: "image/png" }), "image.png");

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to send image to webhook: ${response.status} ${response.statusText}`);
    }
}

async function stwp_steal_image_from_gallery() {
    var buttons = gradioApp().querySelectorAll(
        '[style="display: block;"].tabitem div[id$=_gallery] .thumbnail-item.thumbnail-small'
    );
    var button = gradioApp().querySelector(
        '[style="display: block;"].tabitem div[id$=_gallery] .thumbnail-item.thumbnail-small.selected'
    );

    if (!button) button = buttons[0];

    if (!button)
        throw new Error("[openoutpaint] No image available in the gallery");

    const canvas = document.createElement("canvas");
    const image = document.createElement("img");
    image.src = button.querySelector("img").src;

    await image.decode();

    canvas.width = image.width;
    canvas.height = image.height;

    canvas.getContext("2d").drawImage(image, 0, 0);

    return canvas.toDataURL("image/png");
}

function stwp_make_it_quack(dataurl) {
    var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "openOutpaint-file", { type: mime });
}