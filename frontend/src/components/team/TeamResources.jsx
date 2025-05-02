import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { BookOpen, Video, GraduationCap } from 'lucide-react'; // lucide icons

const typeIcons = {
  documentation: <BookOpen className="w-4 h-4 inline mr-1" />,
  video: <Video className="w-4 h-4 inline mr-1" />,
  tutorial: <GraduationCap className="w-4 h-4 inline mr-1" />,
  course: <GraduationCap className="w-4 h-4 inline mr-1" />,
  interactive: <GraduationCap className="w-4 h-4 inline mr-1" />
};

const TeamResources = ({ teamId }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        if (!teamDoc.exists()) return;

        const teamData = teamDoc.data();
        const technologies = teamData.skills || [];

        if (technologies.length > 0) {
          const resourcesQuery = query(
            collection(db, 'resources'),
            where('__name__', 'in', technologies.map(t => t.toLowerCase()))
          );

          const querySnapshot = await getDocs(resourcesQuery);
          const resourcesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setResources(resourcesData);
        } else {
          setResources([]);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#261FB3]"></div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-zinc-700">
        <h2 className="text-2xl font-extrabold text-[#261FB3] dark:text-white mb-4">Team Resources</h2>
        <p className="text-gray-600 dark:text-gray-400">No resources available for this team's technologies.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-zinc-700">
      <h2 className="text-2xl font-extrabold text-[#261FB3] dark:text-white mb-6">Team Resources</h2>
      <div className="space-y-6">
        {resources.map(tech => (
          <div
            key={tech.id}
            className="bg-[#f5f7ff] dark:bg-zinc-800 border border-[#e2e8f0] dark:border-zinc-700 rounded-xl p-5"
          >
            <h3 className="text-xl font-bold text-[#261FB3] dark:text-white mb-4">{tech.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tech.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-[#e2e8f0] dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 hover:bg-[#261FB3] hover:text-white dark:hover:bg-zinc-800 transition-colors"
                >
                  <h4 className="text-lg font-semibold text-[#261FB3] dark:text-blue-400 mb-1">{resource.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{resource.description}</p>
                  <span className="text-sm inline-flex items-center text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded">
                    {typeIcons[resource.type] || null}
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamResources;
