from firebase_admin import firestore
from datetime import datetime

def initialize_resources():
    db = firestore.client()
    
    resources = {
        "web_development": {
            "name": "Web Development",
            "resources": [
                {
                    "title": "MDN Web Docs",
                    "url": "https://developer.mozilla.org/",
                    "description": "Comprehensive documentation for web technologies",
                    "type": "documentation"
                },
                {
                    "title": "freeCodeCamp",
                    "url": "https://www.freecodecamp.org/",
                    "description": "Free interactive coding lessons",
                    "type": "tutorial"
                }
            ]
        },
        "react": {
            "name": "React",
            "resources": [
                {
                    "title": "React Documentation",
                    "url": "https://reactjs.org/docs/getting-started.html",
                    "description": "Official React documentation",
                    "type": "documentation"
                },
                {
                    "title": "React Tutorial",
                    "url": "https://react-tutorial.app/",
                    "description": "Interactive React tutorial",
                    "type": "tutorial"
                }
            ]
        },
        "python": {
            "name": "Python",
            "resources": [
                {
                    "title": "Python Docs",
                    "url": "https://docs.python.org/3/",
                    "description": "Official Python documentation",
                    "type": "documentation"
                },
                {
                    "title": "Python for Beginners",
                    "url": "https://www.learnpython.org/",
                    "description": "Interactive Python tutorials",
                    "type": "tutorial"
                }
            ]
        },
        "nodejs": {
            "name": "Node.js",
            "resources": [
                {
                    "title": "Node.js Documentation",
                    "url": "https://nodejs.org/en/docs/",
                    "description": "Official Node.js documentation",
                    "type": "documentation"
                },
                {
                    "title": "Node.js Crash Course",
                    "url": "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
                    "description": "Beginner-friendly crash course",
                    "type": "video"
                }
            ]
        },
        "expressjs": {
            "name": "Express.js",
            "resources": [
                {
                    "title": "Express Documentation",
                    "url": "https://expressjs.com/",
                    "description": "Official Express.js documentation",
                    "type": "documentation"
                },
                {
                    "title": "Express Tutorial",
                    "url": "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs",
                    "description": "MDN Express tutorial",
                    "type": "tutorial"
                }
            ]
        },
        "mongodb": {
            "name": "MongoDB",
            "resources": [
                {
                    "title": "MongoDB Docs",
                    "url": "https://www.mongodb.com/docs/",
                    "description": "Official MongoDB documentation",
                    "type": "documentation"
                },
                {
                    "title": "MongoDB University",
                    "url": "https://university.mongodb.com/",
                    "description": "Free MongoDB courses",
                    "type": "course"
                }
            ]
        },
        "firebase": {
            "name": "Firebase",
            "resources": [
                {
                    "title": "Firebase Docs",
                    "url": "https://firebase.google.com/docs",
                    "description": "Official Firebase documentation",
                    "type": "documentation"
                },
                {
                    "title": "Firebase Full Course",
                    "url": "https://www.youtube.com/watch?v=9kRgVxULbag",
                    "description": "Firebase course on YouTube",
                    "type": "video"
                }
            ]
        },
        "git": {
            "name": "Git & GitHub",
            "resources": [
                {
                    "title": "Git Docs",
                    "url": "https://git-scm.com/doc",
                    "description": "Official Git documentation",
                    "type": "documentation"
                },
                {
                    "title": "GitHub Learning Lab",
                    "url": "https://lab.github.com/",
                    "description": "Hands-on GitHub tutorials",
                    "type": "interactive"
                }
            ]
        },
        "docker": {
            "name": "Docker",
            "resources": [
                {
                    "title": "Docker Docs",
                    "url": "https://docs.docker.com/",
                    "description": "Official Docker documentation",
                    "type": "documentation"
                },
                {
                    "title": "Docker Mastery",
                    "url": "https://www.udemy.com/course/docker-mastery/",
                    "description": "Popular Docker course (paid)",
                    "type": "course"
                }
            ]
        },
        "kubernetes": {
            "name": "Kubernetes",
            "resources": [
                {
                    "title": "Kubernetes Docs",
                    "url": "https://kubernetes.io/docs/",
                    "description": "Official Kubernetes documentation",
                    "type": "documentation"
                },
                {
                    "title": "Kubernetes Tutorial",
                    "url": "https://www.youtube.com/watch?v=X48VuDVv0do",
                    "description": "Kubernetes crash course (YouTube)",
                    "type": "video"
                }
            ]
        },
        "machine_learning": {
            "name": "Machine Learning",
            "resources": [
                {
                    "title": "Google ML Crash Course",
                    "url": "https://developers.google.com/machine-learning/crash-course",
                    "description": "ML concepts and hands-on exercises",
                    "type": "course"
                },
                {
                    "title": "Scikit-learn Docs",
                    "url": "https://scikit-learn.org/stable/documentation.html",
                    "description": "Python ML library documentation",
                    "type": "documentation"
                }
            ]
        },
        "java": {
            "name": "Java",
            "resources": [
                {
                    "title": "Java Docs",
                    "url": "https://docs.oracle.com/en/java/",
                    "description": "Official Java documentation",
                    "type": "documentation"
                },
                {
                    "title": "Java Tutorial for Beginners",
                    "url": "https://www.youtube.com/watch?v=grEKMHGYyns",
                    "description": "Full beginner Java course",
                    "type": "video"
                }
            ]
        },
        "cpp": {
            "name": "C++",
            "resources": [
                {
                    "title": "C++ Reference",
                    "url": "https://en.cppreference.com/w/",
                    "description": "Comprehensive C++ reference",
                    "type": "documentation"
                },
                {
                    "title": "C++ Full Course",
                    "url": "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
                    "description": "C++ tutorial for beginners",
                    "type": "video"
                }
            ]
        }
    }

    resources_ref = db.collection('resources')
    for tech_id, tech_data in resources.items():
        # Convert the 'name' field to lowercase
        tech_data['name'] = tech_data['name'].lower()

        resources_ref.document(tech_id).set({
            **tech_data,
            "last_updated": datetime.utcnow().isoformat()
        })
        print(f"✅ Uploaded: {tech_data['name']}")
