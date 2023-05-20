var stwp = {
    latestPrompts: {
        prompt: "",
        negative: ""
    }
};

/**
 * Checks whether the new prompt isn't equal to the currnet prompt, thus making it a check for whether the new prompt is *new* or just the same.
 * @param {{prompt: string, negative: string}} prompts The new prompt
 * @returns Whether the new prompt is different from the current prompt
 */
function stwp_is_new_prompt(prompts) {
    let current = stwp.latestPrompts;

    return prompts.prompt !== current.prompt || prompts.negative !== current.negative
}

/**
 * A wrapper function for the async version :3
 * @param {string} username The username to use on the webhook
 * @param {string} url The URL of the webhook
 */
function stwp_send_to_webhook(username, url) {
    stwp_just_fucking_send_it(username, url).then(console.log("Sent!")).catch(console.warn);
}

/**
 * Gathers the current prompt and negative prompt from the UI
 * @returns {{prompt: string, negative: string}} The prompts, taken from the UI
 */
function stwp_get_prompts() {
    const gr = gradioApp();

    /** @type {HTMLTextAreaElement} */
    const prompt = gr.querySelector("#txt2img_prompt > label > textarea");
    /** @type {HTMLTextAreaElement} */
    const negativePrompt = gr.querySelector("#txt2img_neg_prompt > label > textarea")

    return {
        prompt: prompt.value,
        negative: negativePrompt.value
    }
}

/**
 * Sends an image to a webhook URL using a specified username.
 * @param {string} username - The username to use when sending the image.
 * @param {string} url - The URL of the webhook to send the image to.
 * @returns {Promise<void>} - A Promise that resolves when the image has been sent successfully.
 */
async function stwp_just_fucking_send_it(username, url) {
    const imageData = await stwp_steal_image_from_gallery();
    const imageFile = stwp_make_it_quack(imageData);
    const image = await imageFile.arrayBuffer();

    const prompts = stwp_get_prompts();
    let resendPrompts = false;

    if (stwp_is_new_prompt(prompts)) {
        window.stwp.latestPrompts = prompts;
        resendPrompts = true;
    }

    const formData = new FormData();

    let content = "A new image just dropped!";

    if (resendPrompts) {
        content += `\nPrompt:\`\`\`${prompts.prompt}\`\`\` Negative:\`\`\`${prompts.negative}\`\`\``;
    }

    formData.append("payload_json", JSON.stringify({
        content,
        username: username,
        file: "image.png",
    }));
    formData.append("file", new Blob([image], { type: "image/png" }), "image.png");

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to send image to webhook: ${response.status} ${response.statusText} `);
    }
}

/**
 * Steals an image from the gallery.
 * @returns {Promise<string>} The data URL of the image
 */
async function stwp_steal_image_from_gallery() {
    var buttons = gradioApp().querySelectorAll(
        '[style="display: block;"].tabitem div[id$=_gallery] .thumbnail-item.thumbnail-small'
    );
    var button = gradioApp().querySelector(
        '[style="display: block;"].tabitem div[id$=_gallery] .thumbnail-item.thumbnail-small.selected'
    );

    if (!button) button = buttons[0];

    if (!button)
        throw new Error("[stwp] No image available in the gallery");

    const canvas = document.createElement("canvas");
    const image = document.createElement("img");
    image.src = button.querySelector("img").src;

    await image.decode();

    canvas.width = image.width;
    canvas.height = image.height;

    canvas.getContext("2d").drawImage(image, 0, 0);

    return canvas.toDataURL("image/png");
}

/**
 * Converts a data URL to a file.
 * @param {string} dataurl A data URL
 * @returns {File} A file
 */
function stwp_make_it_quack(dataurl) {
    var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "stwp-file", { type: mime });
}
