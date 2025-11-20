(function() {
  const React = window.React;
  const { FIXED_ARTICLES } = window.GameApp.constants;

  const ArticleSelector = ({ onSelect }) => {
    const articles = FIXED_ARTICLES;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-serif font-bold text-stone-900 mb-4 tracking-widest">文心雕龍</h1>
          <p className="text-stone-600 italic">探驪得珠 · 循序漸進</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <button
              key={article.id}
              onClick={() => onSelect(article)}
              className="group relative bg-white border-2 border-stone-200 p-6 text-left hover:border-stone-800 transition-all duration-300 shadow-sm hover:shadow-md rounded-sm"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-stone-800 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2 group-hover:text-stone-700">
                {article.title}
              </h3>
              <p className="text-stone-500 text-sm font-serif mb-4">{article.author}</p>
              <p className="text-stone-400 text-xs line-clamp-2 font-serif leading-relaxed">
                {article.paragraphs[0]}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  window.GameApp.components.ArticleSelector = ArticleSelector;
})();