/* DOM ELEMENTS */
const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");

generateForm.addEventListener("submit", (e) => {
	//Submit refreshes the page, to prevent it, we use e.preventDefault()
	e.preventDefault();

	//Form controllers are taken in Form elements. (input,checkbox,select vs)
	//We can bring them in array form
	//console.log(e.target.value); //undefined
	//console.log(e.target[0].value); //input value - array form

	const userPrompt = e.target[0].value;
	const userImgQuantity = parseInt(e.target[1].value);

	//console.log(userImgQuantity, userPrompt);

	//Loading state

	//Array.from ----> iterable (repeatable) and array-like (like an array) object

	const imgCardMarkup = Array.from(
		{ length: userImgQuantity },
		() =>
			`<div class="img-card loading">
				<img src="images/loading.gif" alt="generated-image" />
				<a href="#" class="download-btn">
					<img src="images/download.png" alt="download icon" />
				</a>
			</div>`
	).join("");

	imageGallery.innerHTML = imgCardMarkup;

	generateAiImages(userPrompt, userImgQuantity);
});

/* //Repating the function n times with Array.from
const repeatCount = 3;
const arr = Array.from({ length: repeatCount }, () => console.log("Hello")); // ---> 3x Hello

 */

//localStorage.setItem("STABILITY_API_KEY", "<INSERT YOUR API KEY HERE>");

const STABILITY_API_KEY = localStorage.getItem("STABILITY_API_KEY");

const generateAiImages = async (userPrompt, userImgQuantity) => {
	try {
		//POST Request will be used
		//Headers -> authorization : Api Key

		const imagePromises = Array.from({ length: userImgQuantity }, async () => {
			const formData = new FormData();
			formData.append("prompt", userPrompt);
			formData.append("model", "sd3-medium");
			formData.append("output_format", "jpeg");

			//Getting the DATA with POST
			const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${STABILITY_API_KEY}`,
					Accept: "image/*",
				},
				body: formData,
			});
			if (!res.ok) {
				throw new Error("Request failed!");
			}

			//We can get the data in different ways
			//1- BLOB (Binary Large Object)
			//2- Base64 Encoding
			//3- Array Buffer
			//4- Data URL

			return res.blob();
		});

		const imageBlobs = await Promise.all(imagePromises);

		//Displaying BLOB in the browser

		imageGallery.innerHTML = imageBlobs
			.map((blob) => {
				const imageUrl = URL.createObjectURL(blob);

				return `
             <div class="img-card">
                <img src=${imageUrl} alt="generated-image">
                <a href=${imageUrl} class="download-btn">
                    <img src="images/download.png" alt="download icon">
                </a>
            </div>`;
			})
			.join("");

		//Downloading the images

		const downloadButtons = document.querySelectorAll(".download-btn");
		downloadButtons.forEach(btn => {
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				const link = document.createElement("a");
				link.href = btn.href;
				link.download = btn.getAttribute("download");
				document.body.appendChild(link);
				link.click();
				//Optionally remove the link after download
				document.body.removeChild(link);
			});
		});
	} catch (error) {
		console.log(error);
	}
};
