'use strict'; import React from 'react';
import Header from '../components/header';

var About = React.createClass({
  render: function () {
    return (
      <div className="page-about">
      <Header />
    <div className='prose row row--centered text-only-page'> 
    <h2>About</h2>      
      <div id="about-content">
      
      <p>The Impact Investing Network Map was developed in partnership with
      the Case Foundation, ImpactAlpha – through its database ImpactSpace –
      and Crunchbase. It is a first stop for both new and experienced impact
      investors, funds and social enterprises to access a quick snapshot of
      what’s happening in the market right now, or complete a more thorough
      interrogation of the impact investing market. The Network Map and the
      data powering it represent the interconnectedness and relationships
      within the market as well as the range and characteristics of deals
      taking place globally, to answer the questions: What makes for a
      trend? Where is money flowing? Who are the standout companies, funds
      and investors? Where is the activity happening, by sector and
      geography?  As the impact investing ecosystem continues to expand, we
      believe it is vital that potential investors, funds and entrepreneurs
      have access to a clear visualization and more complete data source,
      therefore the Impact Investing Network, in concert with ImpactSpace,
      is intended to aggregate and make readily available all of the public
      data on impact investing deals and the companies and organizations
      diriving them. </p>
      
      <h3>How does it work?</h3>
      
      <p>Many people have heard the term impact investing, which we define
      as investments into companies, organizations and funds seeking to
      generate both social and financial returns, but can feel lost in the
      multitude of definitions, data resources and reporting. It can be
      difficult to identify who is active in which industries and locales,
      if there is impact being created or money to be made.</p>
      
      <p>For these reasons, the Market Insights (hyperlink) is a great entry
      point, orienting new users within the larger impact investing Network.
      The Insights spotlight key players, industries and geographies, which
      surfaces some familiar names and introduces some new faces.</p>
      
      <p>Once a baseline of understanding the Network has been set, the next
      step is to jump over to the Map (hyperlink). Users will have the
      option to dive straight in, clicking through to explore the individual
      nodes, connections and natural market groupings; or to use the filters
      to manipulate the visualization while cutting through layers of
      complex information narrowing down market segments and identifying
      specific data points. By combining the Market Insights and Map tool,
      Impact Investing Network Map is intended to give users a self guided
      exploratory experience that is simultaneously seamless, flexible and
      fun!</p>
      
      <h3>What we believe</h3>
      
      <p>We believe in the power of the private sector to increase the pool of
      resources being put to use tackling big, persistent social problems
      and making positive strides toward better, more sustainable
      environmental outcomes. Increasingly we find the passion and drive of
      social entrepreneurs mirrored in the early stage investors who support
      them and the creation of thriving network and markets of social good
      businesses. We think it is time for traditional markets to recognize
      and celebrate the increasing number and range of marketable deals, the
      diversity of active investors and the energy being generated in
      booming geographies and industries. Our hope is that by answering some
      of the early ecosystem questions, the Impact Investing Network Map
      will be a key resource in paving the way to activation for greater
      numbers of impact investors and social entrepreneurs.</p>
      
      <h3>What do you think?</h3>
      
      <p>We are testing the beta version of the Impact Investing Network Map in
      order to engage with you and hear your thoughts about what you think
      is and isn’t working. We welcome your questions and feedback.</p>
      
      <p>As we continue to develop and iterate on the Network Map, we hope that
      you’ll share your thoughts on how we can adjust and improve the
      functionality, the visual narrative and the data accessibility. No
      question or comment is too large or too small. We hope you will use
      the feedback form (hyperlink) to let us know what you think!</p>
      
      <p>Partners The Case Foundation, established by digital pioneers Jean and
      Steve Case, invests in people and ideas that can change the world. For
      nearly two decades, the Foundation has focused on creating programs
      and investing in people and organizations that harness
      entrepreneurship, innovation, technology and collaboration to address
      urgent social challenges. Their work is rooted in three key pillars:
      revolutionizing the philanthropic sector, unleashing the power of
      entrepreneurship to create social change and igniting civic engagement
      through citizen-driven solutions.</p>
      
      <p>ImpactSpace is the open data platform powering the global impact
      marketplace. Together with its sister site, ImpactAlpha, ImpactSpace
      is providing stories and data to investors, entrepreneurs and other
      market participants driving business advantage with social and
      environmental impact. ImpactSpace makes information about the impact
      market readily available to everyone and maintainable by anyone. It
      helps you connect with companies and investors generating financial
      returns through the creation of environmental and social value.
      ImpactSpace and ImpactAlpha are part of ImpactAlpha Inc., a media
      brand that is redrawing the boundaries of business for a new era of
      investing. Together, ImpactAlpha and ImpactSpace deliver high-quality
      original content and company and investor data to accelerate the
      growth of the impact market.</p>
      
      <p>CrunchBase is the leading platform to discover innovative companies
      and the people behind them. Founded in 2007 by Mike Arrington, it
      began as a simple crowd sourced database to track startups covered on
      TechCrunch. Today, Crunchbase delivers market insights to millions of
      users and businesses around the world. The CrunchBase Dataset is
      constantly expanding through contributions from our community of
      users, investment firms, and network of global partners</p>
</div> 
<div id="float-to-side">
<h3>Call to action</h3>
      
      <p>From the localized investments of Community Development Finance
      Institutions (CDFIs), to CalPers’ sustainable investment strategies,
      to Angel investments in fledgling companies in cities around the
      world, we know that impact investing provides rich market
      opportunities for sound investments with the potential to generate
      competitive returns and transformative impact.</p>
      
      <p>As a tool that showcases the currently available data on this market,
      the Impact Investing Network Map is only as a good as the data
      powering it, and it reveals not only who is active but also who is
      most actively contributing what they have learned, achieved and
      developed through their own networks and experiences to educate others
      and inform the field. To encourage greater transparency and community,
      the Impact Investing Network Map naturally elevates organizations that
      value both actively generating deals and sharing that activity and the
      outcomes. Therefore, if you or your organization is engaged in making
      impact investments, or you have a social good company and you don’t
      see yourself or your connections in the Network, you can change that
      by adding your information now to <a href="http://impactspace.com/" target="_blank">ImpactSpace</a>, so
      you can be sure that your contributions are represented. </p>

      <p className='share-data'><a className='bttn bttn-base-dark share-data' href="http://impactspace.com/addtoimpactspace" target="_new">Share your data</a></p>
</div>
</div>
</div> 

    );
  }
});

module.exports = About;
