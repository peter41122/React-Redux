'use strict'; import React from 'react';
import Header from '../components/header';

var Faq = React.createClass({
  render: function () {
    return (
        <div className="page-faq">
        <Header />
    <div className='prose row row--centered text-only-page'>       
        <h2>FAQ</h2>
        

        <ul>
            <li>
                <input type="checkbox" name="faq-1" id="faq-1" />
                <label htmlFor="faq-1">How do you define impact investing and social enterprise?</label>
                <p>There are a number of useful definitions for impact investing and social enterprise. For the purpose of the Impact Investing Network Map, we are using the definitions used by ImpactAlpha for inclusion in the ImpactSpace database; therefore:
        Impact investing is defined as financial investments into companies, organizations and funds seeking to generate financial returns as well as positive social, environmental and/or governance outcomes; and 
        Social enterprise is defined as a for-profit company that intends to generate profits in addition to demonstrable positive social, environmental and/or governance outcomes.</p>
            </li>
            <li>
                <input type="checkbox" name="faq-2" id="faq-2" />
                <label htmlFor="faq-2">How are companies, investors, funds, etc. selected to appear on the Network Map?</label>
                <p>The Impact Investing Network Map displays the companies, investors, funds, etc. that appear on ImpactSpace – ImpactAlpha’s open source data platform. The individuals and organizations included on ImpactSpace are, to the best of the Partner’s knowledge, representative of the definitions of impact investing and social enterprise used for the Impact Investing Network Map(hyperlink to the definition above).</p>
            </li>
            <li>
                <input type="checkbox" name="faq-3" id="faq-3" />
                <label htmlFor="faq-3">How are companies, investors, funds, etc. selected to appear in the Market Insights, and where does this data come from?</label>
                <p>The companies, investors, funds and all other data that appears in the Market Insights is representative of the aggregated data provided by both partners, ImpactAlpha and Crunchbase through their respective databases.</p>
            </li>
            <li>
                <input type="checkbox" name="faq-4" id="faq-4" />
                <label htmlFor="faq-4">My business is not on the map. How can I make sure my social enterprise is represented?</label>
                <p>The process of including your business and networks is simple. Click here to complete your profile and access the ImpactSpace upload form.</p>
            </li>
            <li>
                <input type="checkbox" name="faq-5" id="faq-5" />
                <label htmlFor="faq-5">My investments are not on the map. How can I make sure my impact investments are represented?</label>
                <p>Including your investments and networks is a quick and seamless process. Click here to complete your profile and access the upload form for ImpactSpace. Be sure to have ___________________________ ready.</p>
            </li>
            <li>
                <input type="checkbox" name="faq-6" id="faq-6" />
                <label htmlFor="faq-6">My business and/or investment information is on the map but it is incorrect or outdated. How can I make edits/updates?</label>
                <p>Happy to hear that you would like to showcase your most current social good activity! To update your information visit ImpactSpace to access your profile and click edit to make the appropriate adjustments. For a larger update, you can also use the bulk upload form here.</p>
            </li>
            <li>
                <input type="checkbox" name="faq-7" id="faq-7" />
                <label htmlFor="faq-7">My business and/or investment information is on the map, but I would like to have it removed. How can I make this adjustment?</label>
                <p>We apologize for including more information than you would like to share. To adjust your information please visit ImpactSpace to access your profile and click edit. We also invite you to share your feedback to help us create a platform where you would like to be included.</p>
            </li>
            <li>
                <input type="checkbox" name="faq-8" id="faq-8" />
                <label htmlFor="faq-8">I love the work and mission of a business, investor or fund on the Impact Investing Network Map; how can I contact them directly?</label>
                <p>Great to know that you are excited by the activity of our peers in the impact investing ecosystem. The Impact Investing Network Map displays the connections that exist in the field and the contact information each entity wishes to share in their profiles on ImpactSpace and Crunchbase. At this time, the Network Map does not provide a tool to directly facilitate further introductions.</p>
            </li>
            <li>
                <input type="checkbox" name="faq-9" id="faq-9" />
                <label htmlFor="faq-9">I would like to make an investment in one or more of the companies or funds featured on the map. What should I do next? </label>
                <p>Good to hear that the companies and funds are sparking your interest to contribute to expanding deal flows. The Partners contributing to the Network Map and any supporting data are not investment advisors. The inclusion of any information on the Impact Investing Network Map is not an indication of an endorsement, recommendation or advice with regard to any investment decisions. Prior to making any investment decisions please seek the advice of an investment professional.</p>
            </li>

        </ul>
        <div id="float-to-side">
                <h3>Glossary</h3>
                <p>
                    <em>Impact Investing</em>
                    Financial investments into companies, organizations, and funds seeking to generate financial returns as well as positive social, environmental and/or governance outcomes<br />
                    <em>Social Enterprise</em>
                    A for-profit company that intends to generate profits in addition to demonstrable positive social, environmental and/or governance outcomes<br />
                    <em>Industry</em>
                    The area of business describing a company’s product and/or service offerings<br />
                    <em>Impact Objective</em>
                    The social and/or environmental impact a company seeks to have through its products, services, and/or business model<br />
                    <em>Investment Rounds</em>
                    <em>Angel/Seed</em>
                    Typically the earliest investments made into a company that help the business get off the ground<br />
                    <em>Venture</em>
                    Early stage funding that supports the growth of emerging companies.<br />
                    <em>Series A, B, C, etc.</em>
                    Sequential rounds of venture funding, with each subsequent round marking further growth in a company
                </p>
            </div>
        </div>  
        </div>

    );
  }
});
module.exports = Faq;
