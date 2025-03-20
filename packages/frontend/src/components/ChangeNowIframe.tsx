import useScript from "@/hooks/useScript";

export const ChangeNowIframe = () => {
  useScript(
    "https://changenow.io/embeds/exchange-widget/v2/stepper-connector.js"
  );

  return (
    <iframe
      id="iframe-widget"
      src="https://changenow.io/embeds/exchange-widget/v2/widget.html?FAQ=true&amount=0.01&amountFiat=20&backgroundColor=FFFFFF&darkMode=false&from=ethbase&fromFiat=usd&horizontal=false&isFiat=true&lang=en-US&link_id=fba4b00498b97a&locales=true&logo=true&primaryColor=00AA54&to=coreum&toFiat=coreum&toTheMoon=true"
      style={{ height: "356px", width: "100%", border: "none" }}
    ></iframe>
  );
};
