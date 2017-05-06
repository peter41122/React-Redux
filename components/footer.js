import React from 'react';

// import SearchBar from './search-bar';
import {
  ShareButtons,
  generateShareIcon
} from 'react-share';

const {
  FacebookShareButton,
  GooglePlusShareButton,
  LinkedinShareButton,
  TwitterShareButton
} = ShareButtons;

const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const GooglePlusIcon = generateShareIcon('google');
const LinkedinIcon = generateShareIcon('linkedin');

var Footer = React.createClass({

    render: function () {
        /* Social buttons */
        const shareUrl = 'http://impactmap.amida-demo.com';
        const title = 'Case Foundation';

        return (<footer className='site-footer' role='contentinfo'>
            <div className='inner'>
                <div className='content'>
                    <p><a>Case Foundation</a>, <a>Charitable Partner</a>, <a>Charitable Partner</a>, <a>Charitable Partner</a>, <a>Charitable Partner</a><br/><span className="disclaimer">*All data subject to quantity and quality limitations present in Impact Alpha’s open data collection system.</span></p>
                </div>
                <div className='authorship'>
                    <p>Sources: <a href=''>Crunchbase</a> and <a href=''>Impactspace</a></p>
                    <p className='last-update'>Last update Jan. 15th 2016</p>
                </div>
                <div className='social-share'>
                    <LinkedinShareButton
                        url={shareUrl}
                        title={title}>
                        <LinkedinIcon
                          size={32}
                          round={true} />
                    </LinkedinShareButton>
                    <GooglePlusShareButton
                        url={shareUrl}>
                        <GooglePlusIcon
                          size={32}
                          round={true} />
                    </GooglePlusShareButton>
                    <TwitterShareButton
                        url={shareUrl}
                        title={title}>
                        <TwitterIcon
                          size={32}
                          round={true} />
                    </TwitterShareButton>
                    <FacebookShareButton
                        url={shareUrl}
                        title={title}>
                        <FacebookIcon
                          size={32}
                          round={true} />
                    </FacebookShareButton>
                    <span className='cta'>Share on : </span>             
                  </div>
            </div>
            <div className='blur-back'></div>
        </footer>)
    }
});

module.exports = Footer;
