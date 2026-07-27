import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/GiftCardPage.css";

const amountOptions = [19000, 39900, 29000, 185900];

function formatAmount(amount) {
    return new Intl.NumberFormat("hu-HU").format(amount);
}

export default function GiftCardPage() {
    const navigate = useNavigate();
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [names, setNames] = useState([""]);
    const [buyerType, setBuyerType] = useState("private");
    const [billingData, setBillingData] = useState({
        privateName: "",
        privateAddress: "",
        companyName: "",
        companyAddress: "",
        taxNumber: "",
    });
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const nameTitle = quantity > 1
        ? "Az ajándékutalványokon szereplő nevek:"
        : "Az ajándékutalványon szereplő név:";

    const buttonText = useMemo(
        () => (isSubmitting ? "Átutalási adatok betöltése..." : "Tovább a fizetéshez"),
        [isSubmitting]
    );

    function updateQuantity(nextQuantity) {
        const normalizedQuantity = Math.max(1, Number(nextQuantity) || 1);
        setQuantity(normalizedQuantity);
        setNames((currentNames) =>
            Array.from({ length: normalizedQuantity }, (_, index) => currentNames[index] || "")
        );
    }

    function changeQuantity(delta) {
        updateQuantity(quantity + delta);
    }

    function updateName(index, value) {
        setNames((currentNames) =>
            currentNames.map((currentName, currentIndex) =>
                currentIndex === index ? value : currentName
            )
        );
    }

    function updateBillingField(field, value) {
        setBillingData((currentData) => ({
            ...currentData,
            [field]: value,
        }));
    }

    function getBillingPayload() {
        if (buyerType === "company") {
            return {
                buyerType,
                companyName: billingData.companyName.trim(),
                companyAddress: billingData.companyAddress.trim(),
                taxNumber: billingData.taxNumber.trim(),
            };
        }

        return {
            buyerType,
            privateName: billingData.privateName.trim(),
            privateAddress: billingData.privateAddress.trim(),
        };
    }

    async function startPayment() {
        const cleanNames = names.map((name) => name.trim());
        const billingPayload = getBillingPayload();

        if (!selectedAmount) {
            alert("Kérlek válassz összeget!");
            return;
        }

        if (buyerType === "company") {
            if (!billingPayload.companyName || !billingPayload.companyAddress || !billingPayload.taxNumber) {
                alert("Kérlek add meg a céges számlázási adatokat!");
                return;
            }
        } else if (!billingPayload.privateName || !billingPayload.privateAddress) {
            alert("Kérlek add meg a magánszemély számlázási adatokat!");
            return;
        }

        if (!email.trim()) {
            alert("Kérlek add meg az email címet!");
            return;
        }

        if (cleanNames.length !== quantity || cleanNames.some((name) => !name)) {
            alert("Kérlek add meg az összes ajándékutalványhoz tartozó nevet!");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch("/api/giftcard/start-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: cleanNames[0],
                    names: cleanNames,
                    email: email.trim(),
                    amount: selectedAmount,
                    quantity,
                    billingData: billingPayload,
                    paymentMethod: "transfer",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Hiba történt: ${data.error || "Ismeretlen hiba"}`);
                return;
            }

            if (data.redirectUrl) {
                navigate(data.redirectUrl);
                return;
            }

            if (data.id) {
                navigate(`/transfer?id=${encodeURIComponent(data.id)}`);
                return;
            }

            alert("Hiba történt: hiányzó redirectUrl/id a válaszban.");
        } catch (error) {
            console.error(error);
            alert("Nem sikerült kapcsolódni a szerverhez.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="giftcard-section bg-cream">
            <div className="container-lg">
                <h1 className="main">Ajándékutalvány Édességkészítő workshopra</h1>
                <p className="second">
                    Lepj meg valakit egy Édes Élménnyel!
                    <br />
                    Az ajándékutalvány 1 fő részére szól és beváltható a ChocoLeaf
                    bármelyik édességkészítő workshopjára az utalvány értékében.
                </p>

                <section className="amount">
                    <h3>Érték:</h3>
                    <div className="amount-buttons">
                        {amountOptions.map((amount) => (
                            <button
                                className={`amount-btn ${selectedAmount === amount ? "active" : ""}`}
                                key={amount}
                                type="button"
                                onClick={() => setSelectedAmount(amount)}
                            >
                                {formatAmount(amount)} Ft
                            </button>
                        ))}
                    </div>
                </section>

                <section className="quantity mt-4">
                    <h3>Mennyiség:</h3>
                    <div className="quantity-input">
                        <button type="button" onClick={() => changeQuantity(-1)}>-</button>
                        <input
                            type="number"
                            value={quantity}
                            min="1"
                            onChange={(event) => updateQuantity(event.target.value)}
                        />
                        <button type="button" onClick={() => changeQuantity(1)}>+</button>
                    </div>
                </section>

                <form className="gift-form" onSubmit={(event) => event.preventDefault()}>
                    <label className="form-label">
                        <h3>{nameTitle}</h3>
                    </label>

                    <div>
                        {names.map((name, index) => (
                            <input
                                className="voucher-name"
                                key={index}
                                type="text"
                                placeholder={quantity > 1 ? `${index + 1}. ajándékutalvány neve` : ""}
                                value={name}
                                onChange={(event) => updateName(index, event.target.value)}
                            />
                        ))}
                    </div>

                    <section className="buyer-type">
                        <h3>Számlázási adatok:</h3>
                        <div className="buyer-type-options">
                            <label className={`buyer-card ${buyerType === "private" ? "active" : ""}`}>
                                <input
                                    checked={buyerType === "private"}
                                    name="buyerType"
                                    type="radio"
                                    value="private"
                                    onChange={() => setBuyerType("private")}
                                />
                                <span>Magánszemély</span>
                            </label>

                            <label className={`buyer-card ${buyerType === "company" ? "active" : ""}`}>
                                <input
                                    checked={buyerType === "company"}
                                    name="buyerType"
                                    type="radio"
                                    value="company"
                                    onChange={() => setBuyerType("company")}
                                />
                                <span>Cég</span>
                            </label>
                        </div>
                    </section>

                    <div className="buyer-fields">
                        {buyerType === "company" ? (
                            <>
                                <label className="form-label buyer-field-label"><h3>Cégnév:</h3></label>
                                <input
                                    className="buyer-input"
                                    type="text"
                                    value={billingData.companyName}
                                    onChange={(event) => updateBillingField("companyName", event.target.value)}
                                />

                                <label className="form-label buyer-field-label"><h3>Székhely:</h3></label>
                                <input
                                    className="buyer-input"
                                    type="text"
                                    value={billingData.companyAddress}
                                    onChange={(event) => updateBillingField("companyAddress", event.target.value)}
                                />

                                <label className="form-label buyer-field-label"><h3>Adószám:</h3></label>
                                <input
                                    className="buyer-input"
                                    type="text"
                                    value={billingData.taxNumber}
                                    onChange={(event) => updateBillingField("taxNumber", event.target.value)}
                                />
                            </>
                        ) : (
                            <>
                                <label className="form-label buyer-field-label"><h3>Név:</h3></label>
                                <input
                                    className="buyer-input"
                                    type="text"
                                    value={billingData.privateName}
                                    onChange={(event) => updateBillingField("privateName", event.target.value)}
                                />

                                <label className="form-label buyer-field-label"><h3>Lakcím:</h3></label>
                                <input
                                    className="buyer-input"
                                    type="text"
                                    value={billingData.privateAddress}
                                    onChange={(event) => updateBillingField("privateAddress", event.target.value)}
                                />
                            </>
                        )}
                    </div>

                    <label className="form-label">
                        <h3>E-mail cím (ahová az utalványt küldjük):</h3>
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </form>

                <button
                    id="PayBtn"
                    className="button-primary mt-4"
                    disabled={isSubmitting}
                    type="button"
                    onClick={startPayment}
                >
                    {buttonText}
                </button>
            </div>
        </section>
    );
}
