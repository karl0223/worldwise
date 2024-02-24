// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useState, useEffect } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { useCities } from "../contexts/CitiesContext";
import Message from "./Message";
import Spinner from "./Spinner";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

// const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode"
const BASE_URL = "https://api.geoapify.com/v1/geocode/reverse";

function Form() {
  const [lat, lng] = useUrlPosition();
  const navigate = useNavigate();

  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [geoCodingError, setGeoCodingError] = useState("");

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);

  const { flagEmoji, createCity, isLoading } = useCities();

  const API_KEY = "54f0be180aef44bfbd4d9b972458f859";

  useEffect(() => {
    if (!lat && !lng) return;

    async function fetchCityData() {
      try {
        const requestOptions = {
          method: "GET",
        };

        setIsLoadingGeocoding(true);
        setGeoCodingError("");
        const res = await fetch(
          `${BASE_URL}?lat=${lat}&lon=${lng}&apiKey=${API_KEY}`,
          requestOptions
        );
        const data = await res.json();

        if (!data.features[0].properties.country)
          throw new Error(
            "That doesn't look like a valid location. Please try again."
          );

        setCityName(
          data.features[0].properties.city ||
            data.features[0].properties.address_line1 ||
            ""
        );
        setCountry(data.features[0].properties.country || "");
        setEmoji(convertToEmoji(data.features[0].properties["country_code"]));
      } catch (err) {
        setGeoCodingError(err.message);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }
    fetchCityData();
  }, [lat, lng, flagEmoji]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName && !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: {
        lat,
        lng,
      },
    };

    await createCity(newCity);
    navigate("/app/cities");
  }
  if (isLoadingGeocoding) return <Spinner />;

  if (!lat && !lng) return <Message message="Please select a location" />;

  if (geoCodingError) return <Message message={geoCodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{flagEmoji(emoji)}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}

        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
