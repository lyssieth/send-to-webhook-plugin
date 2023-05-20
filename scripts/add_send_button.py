import gradio as gr
from modules import script_callbacks, shared


COMPONENTS_TO_FIDDLE = ["image_buttons_txt2img", "image_buttons_img2img"]


def after_component(component: gr.components.Component, **kwargs):
    webhook_username = shared.opts.stwp_webhook_username or ""
    webhook_url = shared.opts.stwp_webhook_url or ""

    if kwargs.get("elem_id") == "extras_tab":
        basic_send_button = gr.Button("Send to Webhook", elem_id="stwp_send_button")
        basic_send_button.click(
            None,
            [],
            None,
            _js=f'() => stwp_send_to_webhook("{webhook_username}", "{webhook_url}")',
        )

    return component


script_callbacks.on_after_component(after_component)
