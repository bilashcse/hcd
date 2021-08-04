const formatSeriesDetails = (data) => {
  const contentData = data.modules.filter((p) => p.contentData !== null)[0]
    .contentData[0];

  return {
    id: data.id,
    pageTitle: data.title,
    name: data.metadataMap.title,
    moduleIds: data.moduleIds,
    movie: !!contentData.seasons
      ? null
      : {
          url: contentData.gist.id,
          name: contentData.gist.title,
        },
    episodes: !!contentData.seasons
      ? contentData.seasons.map((p) => {
          return {
            id: p.id,
            title: p.title,
            episodes: p.episodes.map((o) => {
              return {
                id: o.id,
                vId: o.gist.id,
                title: o.title,
              };
            }),
          };
        })
      : null,
  };
};

module.exports = { formatSeriesDetails };
