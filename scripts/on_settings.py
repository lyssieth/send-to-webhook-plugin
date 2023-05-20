import modules.scripts as scripts
import gradio as gr

from modules import shared
from modules import script_callbacks


def on_ui_settings():
    section = ("send-to-webhook-plugin", "Send to Webhook")

    shared.opts.add_option(
        "stwp_webhook_username",
        shared.OptionInfo(
            "N/A",
            "Username to send the request as",
            gr.Textbox,
            {"interactive": True},
            section=section,
        ),
    )
    shared.opts.add_option(
        "stwp_webhook_url",
        shared.OptionInfo(
            "N/A",
            "URL to send the request to",
            gr.Textbox,
            {"interactive": True},
            section=section,
        ),
    )


script_callbacks.on_ui_settings(on_ui_settings)
