function showError(error) {

    console.error(error);

    document
        .getElementById("error")
        .style.display = "block";

    document
        .getElementById("errorText")
        .textContent =
        String(
            error?.stack ||
            error
        );

}


window.addEventListener(
    "error",
    event => {

        if (event.error) {

            showError(
                event.error
            );

        }

    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        showError(
            event.reason
        );

    }
);
