import { useEffect, useState } from "react";
import { getCourses } from "../api/courses";

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getCourses()
            .then(setCourses)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <h2>Betöltés...</h2>;

    if (error) return <h2>{error}</h2>;

    return (
        <div>
            <h1>Képzések</h1>

            {courses.map((course) => (
                <div key={course.id}>
                    <h2>{course.title}</h2>

                    <p>{course.description}</p>

                    <p>
                        Ár: {course.price.toLocaleString("hu-HU")} Ft
                    </p>

                    <p>
                        Kapacitás: {course.capacity} fő
                    </p>

                    <hr />
                </div>
            ))}
        </div>
    );
}