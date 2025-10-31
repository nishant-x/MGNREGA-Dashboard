import axios from "axios";

export default async function handler(req, res) {
  const { state, district } = req.query;

  if (!state || !district) {
    return res.status(400).json({ success: false, message: "State and District are required." });
  }

  try {
    const response = await axios.get(
      "https://api.data.gov.in/resource/655684a3-bd09-4b69-96c0-12d1b49a0b29",
      {
        params: {
          "api-key": "579b464db66ec23bdd0000016927af13b1c043c8556a7fd06e56e19b",
          format: "json",
          limit: 50,
          "filters[state_name]": state,
          "filters[district_name]": district,
        },
      }
    );

    res.status(200).json({ success: true, data: response.data.records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
